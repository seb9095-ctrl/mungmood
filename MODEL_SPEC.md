# MODEL_SPEC.md: MungMood Dog Mood Model

## 1. Dataset

| Item | Value |
|---|---|
| Name | Dog_Emotion_Dataset_v2 (Hugging Face) |
| Link | https://huggingface.co/datasets/Dewa/Dog_Emotion_Dataset_v2 |
| License | creativeml-openrail-m (non-commercial coursework use) |
| Task | 4-class image classification |
| Classes (label index) | 0 sad, 1 angry, 2 relaxed, 3 happy |
| Size | 4,000 RGB images, 1,000 per class |
| Splits | train 2,720 / validation 480 (stratified 85:15 from original train 3,200) / test 800 (original) |
| Cleaning | Remove 4 exact duplicates (so train and test do not overlap) and 12 images under 128 px |
| Backup data | Kaggle "Dog Emotions Prediction" (15,921 images, same 4 classes) |

Known data issues (see report Section 3): rotated copies with black corners are concentrated in `angry` and `sad`; many `sad` images have cage backgrounds; `relaxed` and `sad` look similar; some images contain several dogs.

## 2. Model Architecture

| | Main model | Baseline |
|---|---|---|
| Backbone | MobileNetV3-Large, ImageNet-pretrained (torchvision) | ResNet18, ImageNet-pretrained |
| Head | `classifier[3] = Linear(1280, 4)` | `fc = Linear(512, 4)` |
| Parameters | 4.21 M | 11.18 M |
| ONNX size FP32 / INT8 | 16.8 MB / 4.4 MB | 44.7 MB / 11.2 MB |
| CPU latency (native ORT, 2 cores) | 4.7 ms | 21.5 ms |

Sizes and latency were measured by exporting the untrained models to ONNX (opset 17) with ONNX Runtime 1.29. Browser latency will be measured in Task 3.

Reason for transfer learning: 3,200 images are too few to train a CNN from scratch; the pretrained backbone already extracts general visual features.

## 3. Training Plan

| Item | Setting |
|---|---|
| Input size | 224 x 224 |
| Train augmentation | RandomResizedCrop(224, scale=(0.6, 1.0)), RandomHorizontalFlip, ColorJitter(0.2, 0.2, 0.2), RandomRotation(20, fill=0) on every class |
| Eval transform | Resize(256), CenterCrop(224) |
| Normalization | mean (0.485, 0.456, 0.406), std (0.229, 0.224, 0.225) |
| Stage 1 | Backbone frozen, head only, 5 epochs, AdamW, lr 1e-3 |
| Stage 2 | All layers, lr 1e-4, cosine decay, up to 25 epochs |
| Batch size | 32 |
| Loss | CrossEntropyLoss(label_smoothing=0.1) |
| Weight decay | 1e-4 |
| Early stopping | Validation macro-F1, patience 5; keep best checkpoint |
| Hardware | Google Colab GPU |
| Reproducibility | Fixed random seed; save split indices to a file |

## 4. Evaluation

- Test set (800 images): accuracy, macro-F1, per-class recall, confusion matrix. Chance level = 0.25.
- Extra check: accuracy on the test subset without rotated copies.
- Grad-CAM on sample images to confirm the model attends to the dog rather than the background.
- Target: test accuracy and macro-F1 >= 0.65.
- Model choice: keep MobileNetV3-Large unless ResNet18 is better by more than 3 points.

## 5. Input / Output Interface

| Item | Specification |
|---|---|
| User input | One JPEG/PNG photo (upload or camera), one dog with a visible face |
| Preprocessing (browser) | Decode to RGB -> resize shorter side to 256 px -> center crop 224 x 224 -> divide by 255 -> normalize with mean/std above -> reorder HWC to NCHW |
| Model input | name `input`, `float32`, shape `[1, 3, 224, 224]` |
| Model output | name `logits`, `float32`, shape `[1, 4]` |
| Class order | `["sad", "angry", "relaxed", "happy"]` (index 0 to 3) |
| Postprocessing | softmax -> probabilities; mood = argmax |
| Low confidence | If max probability < 0.5, show "Not sure: try a photo where the face is clearly visible" |
| Service action | Show predicted mood, one probability bar per class, and the care tip for that mood |

Example output:

```json
{ "mood": "happy", "probs": { "sad": 0.04, "angry": 0.02, "relaxed": 0.13, "happy": 0.81 } }
```

## 6. Inference and Deployment Plan

1. Export best checkpoint:
   ```python
   torch.onnx.export(model, torch.randn(1, 3, 224, 224), "mungmood.onnx",
                     input_names=["input"], output_names=["logits"], opset_version=17)
   ```
2. Check that PyTorch and ONNX Runtime predictions match on the test set.
3. Place `mungmood.onnx` in the Next.js `public/models/` folder.
4. In the browser, load it with `onnxruntime-web` (WASM backend) and run inference on the user's device. No GPU server is needed and photos are not uploaded.

| Risk | Plan |
|---|---|
| FP32 file (16.8 MB) loads slowly on mobile | Use INT8 dynamic quantized model (4.4 MB) after checking its test accuracy |
| Browser inference fails or is too slow | CPU inference API on Hugging Face Spaces |
| Preprocessing in JS differs from PyTorch | Compare JS and Python outputs on the same sample images |
