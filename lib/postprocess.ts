import { MOOD_ORDER, MoodType } from './tips';
export interface PredictionResult {
  mood: MoodType; confident: boolean; maxProb: number;
  probs: Record<MoodType, number>; isDemo: boolean;
}
export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sumExps);
}
export function postprocessLogits(logits: number[], isDemo = false): PredictionResult {
  const p = softmax(logits);
  const probs = { sad: p[0], angry: p[1], relaxed: p[2], happy: p[3] };
  let maxIdx = 0;
  for (let i = 1; i < p.length; i++) if (p[i] > p[maxIdx]) maxIdx = i;
  return { mood: MOOD_ORDER[maxIdx], confident: p[maxIdx] >= 0.5, maxProb: p[maxIdx], probs, isDemo };
}
