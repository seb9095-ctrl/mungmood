import { postprocessLogits, PredictionResult } from './postprocess';
export async function analyzeDogMoodDemo(_file: File): Promise<PredictionResult> {
  await new Promise((r) => setTimeout(r, 600));
  return postprocessLogits([-1.5, -2.2, -0.32, 1.51], true);
}
