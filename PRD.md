# PRD.md: MungMood (멍무드)

> A web service that reads a dog's mood from one photo and gives the owner a matching care tip.
> Companion document: `MODEL_SPEC.md` (dataset, model, training, interface details).

---

## 1. Project Overview and Target Users

### 1.1 Overview

MungMood lets a dog owner take or upload one photo of their dog and immediately see which of four moods the dog most likely shows (**sad, angry, relaxed, happy**), how confident the model is, and a short, practical care tip for that mood.

All AI inference runs **inside the user's browser**. The photo never leaves the device, so the service needs no GPU server and raises no photo-privacy concerns.

### 1.2 Problem

Owners, especially first-time owners, often cannot tell whether a dog is calm, stressed, or upset. Body-language guides exist, but they are long and abstract. MungMood gives a quick, visual second opinion and a concrete next action.

### 1.3 Target Users

| User | Situation |
|---|---|
| First-time dog owners | Unsure how to read their dog's face and posture |
| Owners of a newly adopted or rescue dog | Want to check whether the dog is settling in |
| Pet sitters / dog walkers | Want a quick check on an unfamiliar dog |
| Casual users | Want a fun, shareable result for their dog's photo |

### 1.4 Out of Scope

- Medical or behavioral diagnosis. MungMood is an informal aid, not veterinary advice.
- Species other than dogs; video or real-time camera streams.
- Identifying individual dogs or breeds.

---

## 2. Primary Use Case and User Workflow

**Primary use case:** "I have a photo of my dog. Tell me how my dog seems to feel and what I can do."

### Step-by-step workflow

1. The user opens the main page and reads a one-line explanation of the service.
2. The browser starts loading the model in the background; a status label shows "Loading model…" then "Ready".
3. The user clicks **Upload photo** (or **Take photo** on mobile) and selects one image of one dog with a visible face.
4. The page shows a preview of the image, cropped to the same square region the model will see.
5. The user clicks **Analyze mood**.
6. The browser preprocesses the image and runs the model (target: result in under 1 second after the model is loaded).
7. The result card shows:
   - the predicted mood with an emoji and label (e.g. 😊 **Happy**),
   - four probability bars (sad, angry, relaxed, happy),
   - the care tip for the predicted mood.
8. If the model's top probability is below 0.5, the card instead shows **"Not sure: try a photo where the face is clearly visible"**, still with the four bars.
9. The user can click **Try another photo** to reset and repeat from step 3.

```
Open page → model loads → choose photo → preview → Analyze → result card (mood + bars + tip)
                                                              └→ low confidence → "Not sure" message
                                                              └→ Try another photo → back to choose photo
```

---

## 3. Core Features and Functional Requirements

Priority: **[E] Essential** (must ship) / **[O] Optional** (only if time allows).

### 3.1 Essential features

| ID | Feature | Functional requirement |
|---|---|---|
| F1 | Service introduction | Main page states the purpose in one sentence and lists the 4 moods the model can recognize. |
| F2 | Photo input | Accept one JPEG or PNG via file picker; on mobile the picker offers the camera (`accept="image/*"`, `capture`). Reject other file types and files over 10 MB with a clear message. |
| F3 | Image preview | Show the selected photo with the 224 × 224 center-crop region the model will use. |
| F4 | Model loading | Load `mungmood.onnx` once per visit with `onnxruntime-web`; show loading / ready / error states. The **Analyze** button is disabled until the model is ready and a photo is selected. |
| F5 | In-browser inference | Preprocess exactly as defined in MODEL_SPEC §5 and run the model on the device. No image is sent to any server. |
| F6 | Result display | Show predicted mood (argmax), probability bars for all 4 classes (percent, one decimal), and the care tip for that mood. |
| F7 | Low-confidence handling | If max probability < 0.5, show the "Not sure" message instead of a mood label. |
| F8 | Reset | **Try another photo** clears the image and the result. |
| F9 | Error handling | Show a readable message if the model fails to load, the image cannot be decoded, or inference throws. The page must not crash. |
| F10 | Disclaimer | Visible note: "For fun and general guidance only. Not veterinary advice." |
| F11 | Responsive UI | Fully usable on a 375 px wide phone screen and on desktop. |

### 3.2 Optional features

| ID | Feature | Description |
|---|---|---|
| O1 | Feedback button | After a result, the user can mark "Correct" or pick the right mood. Saved to Supabase (see §7). |
| O2 | Share result | Download the result card as a PNG image (generated in the browser). |
| O3 | Session history | Show the last 5 results of the current visit (thumbnails kept in memory only). |
| O4 | About the model page | Dataset, accuracy, confusion matrix, Grad-CAM examples, and known limitations. |
| O5 | Korean / English toggle | UI text in both languages. |
| O6 | Server fallback | If browser inference fails, call a CPU inference API on Hugging Face Spaces (only with clear notice that the photo will be uploaded). |

### 3.3 Care tips (content for F6)

| Mood | Care tip shown to the user |
|---|---|
| Sad | Spend some quiet time together, offer a favorite toy, and check whether routine, food, or walks have changed recently. If low mood lasts several days, consult a vet. |
| Angry | Give the dog space and avoid reaching toward its face. Remove the likely trigger (other dogs, loud noise, strangers) and let it calm down before interacting. |
| Relaxed | Your dog seems calm. Keep the environment quiet and let it rest; this is a good time for gentle petting. |
| Happy | Your dog seems happy and engaged. Great moment for play, a short training session, or a walk. |

---

## 4. AI Model: Role, Input, Output, and Expected Behavior

### 4.1 Role

The trained model is the core of the service: it converts a photo into a mood prediction, and **that prediction decides which label, bars, and care tip the user sees**. Without the model the service has no output. The model is fine-tuned by our team (MobileNetV3-Large, ImageNet-pretrained, 4-class head) on Dog_Emotion_Dataset_v2; see MODEL_SPEC §1–3.

### 4.2 Interface

| Item | Specification |
|---|---|
| User input | One JPEG/PNG photo, one dog, face visible |
| Preprocessing (browser) | Decode to RGB → resize shorter side to 256 px → center crop 224 × 224 → ÷255 → normalize (mean 0.485/0.456/0.406, std 0.229/0.224/0.225) → HWC to NCHW |
| Model input | `input`, `float32`, `[1, 3, 224, 224]` |
| Model output | `logits`, `float32`, `[1, 4]` |
| Class order | `["sad", "angry", "relaxed", "happy"]` |
| Postprocessing | softmax → probabilities; mood = argmax; "Not sure" if max < 0.5 |

Example result object used by the UI:

```json
{ "mood": "happy", "confident": true,
  "probs": { "sad": 0.04, "angry": 0.02, "relaxed": 0.13, "happy": 0.81 } }
```

### 4.3 Expected behavior

- Test-set accuracy and macro-F1 ≥ 0.65 (chance = 0.25).
- Same image → same result every time (deterministic).
- Browser probabilities match PyTorch probabilities within 0.01 for the same image.
- Inference under 1 s on a mid-range laptop after the model is loaded.
- Known weaknesses communicated to the user: relaxed vs. sad confusion, photos with several dogs, faces turned away. Photos without a dog still produce a prediction (no "no dog" class); the low-confidence rule and the input guidance reduce but do not remove this.

---

## 5. Page Layout and UI Requirements

### 5.1 Pages

| Route | Purpose | Priority |
|---|---|---|
| `/` | Introduction + analyzer + result (whole main workflow on one page) | E |
| `/about` | Model and dataset information, limitations | O |

### 5.2 Main page layout (`/`)

```
┌──────────────────────────────────────────────┐
│ Header: 🐶 MungMood            [About]       │
├──────────────────────────────────────────────┤
│ Hero: "How is your dog feeling?"             │
│ One-line description · 4 mood chips          │
├──────────────────────┬───────────────────────┤
│ INPUT PANEL          │ RESULT PANEL          │
│ [Upload] [Camera]    │ 😊 Happy  (81.0%)     │
│ ┌──────────────┐     │ sad      ▇ 4.0%       │
│ │ photo preview│     │ angry    ▏ 2.0%       │
│ │ (crop frame) │     │ relaxed  ▇▇ 13.0%     │
│ └──────────────┘     │ happy    ▇▇▇▇▇▇ 81.0% │
│ Model: ● Ready       │ Care tip: …           │
│ [ Analyze mood ]     │ [Try another photo]   │
├──────────────────────┴───────────────────────┤
│ Tips for a good photo · Disclaimer · Footer  │
└──────────────────────────────────────────────┘
```

On screens narrower than 768 px the two panels stack vertically (input above result).

### 5.3 UI requirements

- Result panel has three clear states: **empty** ("Your result will appear here"), **loading** (spinner while inferring), **result / not sure / error**.
- Each mood has a fixed color and emoji used consistently in chips, bars, and the result label.
- The **Analyze** button shows a disabled state with a reason ("Loading model…" or "Choose a photo first").
- Text contrast meets WCAG AA; images have alt text; all controls are reachable by keyboard.
- Until the real model is integrated (Task 1 build), the result panel must be labeled **"Demo placeholder: not a real prediction"**. Hard-coded results must never look like real inference.

---

## 6. Technology Stack and System Architecture

### 6.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Required stack; static pages are enough |
| Styling | Tailwind CSS | Required stack; fast responsive layout |
| Inference | `onnxruntime-web` (WASM backend) | Runs the ONNX model on the user's device, no server cost |
| Model file | `public/models/mungmood.onnx` (INT8 ≈ 4.4 MB, FP32 ≈ 16.8 MB) | Served as a static asset by Vercel |
| Training | PyTorch + torchvision on Google Colab | See MODEL_SPEC §3 |
| Database (optional) | Supabase (Postgres) | Only for O1 feedback |
| Hosting | GitHub + Vercel | Required; auto deploy on push to `main` |

### 6.2 Architecture

```
            ┌──────────────── User's browser ────────────────┐
 User ──▶   │ Next.js page (React UI)                        │
 photo      │   │ 1. read file (never uploaded)              │
            │   ▼                                            │
            │ preprocess.ts (resize, crop, normalize, NCHW)  │
            │   │ Float32Array [1,3,224,224]                 │
            │   ▼                                            │
            │ onnxruntime-web session ◀── mungmood.onnx ─────┼── Vercel static
            │   │ logits [1,4]                               │   (/models/)
            │   ▼                                            │
            │ softmax → mood, probs → Result card + care tip │
            └───────────────┬────────────────────────────────┘
                            │ (optional O1: label + probs only, no image)
                            ▼
                     Supabase `feedback` table
```

### 6.3 Main code modules

| Module | Responsibility |
|---|---|
| `lib/model.ts` | Create and cache the ONNX Runtime session; expose `predict(tensor)` |
| `lib/preprocess.ts` | Image → normalized `Float32Array` (must match PyTorch eval transform) |
| `lib/postprocess.ts` | Softmax, argmax, confidence threshold, class names |
| `lib/tips.ts` | Mood → emoji, color, care tip |
| `components/ImageInput.tsx`, `ResultCard.tsx`, `ProbBars.tsx` | UI pieces |

---

## 7. Data Storage Requirements

**Essential version: no database.** Photos and results stay in browser memory and disappear when the page is closed. No accounts, no login.

**Optional (O1 feedback):** one Supabase table, written with the public anon key and an insert-only Row Level Security policy. **No image or personal data is stored.**

Table `feedback`

| Field | Type | Meaning |
|---|---|---|
| `id` | uuid, PK, default `gen_random_uuid()` | Row id |
| `created_at` | timestamptz, default `now()` | Time of feedback |
| `predicted` | text | Model's mood (`sad` / `angry` / `relaxed` / `happy` / `unsure`) |
| `user_label` | text | Mood the user says is correct |
| `probs` | jsonb | The 4 probabilities |
| `model_version` | text | e.g. `mnv3l-int8-v1` |

Use: measure how often real users agree with the model and which classes are confused, for the Task 4 "test with new inputs and fix problems" step. Keys go in Vercel environment variables; the service-role key is never committed.

---

## 8. Deployment Approach and Technical Risks

### 8.1 Deployment

1. Code in a public GitHub repo; Vercel builds and deploys every push to `main`, preview deploys for pull requests.
2. Task 1: deploy the UI with a clearly labeled placeholder result.
3. Task 3: add `mungmood.onnx` to `public/models/`, configure the `onnxruntime-web` WASM files to be served from the app, and verify on the deployed URL.
4. Task 4: test the deployed site on desktop Chrome, mobile Chrome (Android), and mobile Safari (iOS) with new photos.

### 8.2 Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Model file too large for mobile networks | Slow first load | Use INT8 dynamic-quantized model (≈ 4.4 MB) if its accuracy drop is ≤ 2 points; show loading state; rely on browser caching |
| JS preprocessing differs from PyTorch | Wrong predictions in the browser only | Run the same 10 test images in Python and in the browser; probabilities must match within 0.01 |
| ONNX operator unsupported in WASM backend | Model fails to load | Export with opset 17 and test in `onnxruntime-web` early (Task 2), before UI integration |
| WASM files not found after Vercel deploy | Inference fails in production only | Set `ort.env.wasm.wasmPaths` explicitly; test on the deployed URL, not only locally |
| Slow inference on old phones | Poor UX | Show spinner; single-thread fallback; optional server fallback (O6) |
| Dataset bias (rotated copies, cage backgrounds in `sad`) | Model learns background, not the dog | Augment all classes equally, evaluate on non-rotated subset, check Grad-CAM (MODEL_SPEC §4) |
| Non-dog or multi-dog photos | Misleading result | Photo guidance text, low-confidence message, disclaimer |
| Secrets leaked in public repo | Security | Only anon key in env vars; `.env*` in `.gitignore` |

---

## 9. Acceptance Criteria

The finished service is accepted when **all** of the following pass on the deployed Vercel URL.

### 9.1 Functional

- [ ] **AC1** The main page loads without errors in desktop Chrome and on a phone, and states the service purpose and the four moods.
- [ ] **AC2** A user can select a JPEG or PNG from the file picker, and on mobile can take a photo with the camera.
- [ ] **AC3** Selecting a non-image file or a file over 10 MB shows an error message and does not crash the page.
- [ ] **AC4** The **Analyze** button is disabled until the model is loaded and a photo is selected.
- [ ] **AC5** After **Analyze**, the result card shows one mood label, four probability bars that sum to 100% (±0.1), and the care tip matching the label.
- [ ] **AC6** For an image whose max probability is below 0.5, the "Not sure" message is shown instead of a mood label.
- [ ] **AC7** **Try another photo** clears the preview and result, and a second analysis works without reloading the page.
- [ ] **AC8** The browser's network log shows **no request containing the image** during analysis.
- [ ] **AC9** The disclaimer is visible on the main page.

### 9.2 AI quality

- [ ] **AC10** The deployed model reaches test accuracy ≥ 0.65 and macro-F1 ≥ 0.65 on the 800-image test set (reported in Task 2).
- [ ] **AC11** For 10 fixed test images, browser probabilities match PyTorch probabilities within 0.01, and all 10 predicted labels match.
- [ ] **AC12** Analyzing the same image twice gives identical results.

### 9.3 Performance and UI

- [ ] **AC13** Model loads in under 5 s on a normal Wi-Fi connection; inference takes under 1 s on a mid-range laptop after loading.
- [ ] **AC14** The layout is usable at 375 px width with no horizontal scrolling.
- [ ] **AC15** Loading, empty, result, not-sure, and error states each have a visible UI.

### 9.4 Task 1 (initial website) criteria

- [ ] **AC16** Deployed Vercel URL opens and shows the main page, the photo input, and the result area.
- [ ] **AC17** Any placeholder result is labeled "Demo placeholder: not a real prediction".
- [ ] **AC18** `PRD.md` and `MODEL_SPEC.md` are in the GitHub repository; no secrets are committed.
