'use client';
import React from 'react';
import { PredictionResult } from '@/lib/postprocess';
import { MOOD_CONFIG } from '@/lib/tips';
import ProbBars from './ProbBars';

export default function ResultCard({ isAnalyzing, result, onReset }: { isAnalyzing: boolean; result: PredictionResult | null; onReset: () => void }) {
  if (isAnalyzing) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="font-semibold text-slate-700">Analyzing your dog&apos;s expression...</p>
      </section>
    );
  }
  if (!result) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[380px]">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">🐾</div>
        <h2 className="text-lg font-bold text-slate-800">2. Mood Analysis Result</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">Your result will appear here after you select a photo and click Analyze Mood.</p>
      </section>
    );
  }
  const info = MOOD_CONFIG[result.mood];
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">2. Mood Analysis Result</h2>
        {result.isDemo && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
            🚧 Demo placeholder: not a real prediction (ONNX model integrated in Task 3)
          </div>
        )}
        {result.confident ? (
          <div className={`p-4 rounded-xl border ${info.bgClass} ${info.borderClass} flex items-center gap-4`}>
            <span className="text-4xl">{info.emoji}</span>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Predicted Mood</p>
              <p className="text-2xl font-extrabold text-slate-900">{info.label} ({(result.maxProb * 100).toFixed(1)}%)</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border bg-slate-100 border-slate-300">
            <p className="font-bold text-slate-800">🤔 Not sure</p>
            <p className="text-xs text-slate-600">Top probability is under 50%. Try a photo where the face is clearly visible.</p>
          </div>
        )}
        <ProbBars probs={result.probs} />
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-4">
          <p className="text-xs font-bold text-slate-700 uppercase mb-1">💡 Recommended Care Tip</p>
          <p className="text-sm text-slate-700">{result.confident ? info.tip : 'Make sure one dog is clearly visible in good lighting.'}</p>
        </div>
      </div>
      <button type="button" onClick={onReset} className="mt-5 w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm">
        ↻ Try another photo
      </button>
    </section>
  );
}
