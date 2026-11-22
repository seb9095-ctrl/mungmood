import React from 'react';
import { MOOD_CONFIG, MOOD_ORDER, MoodType } from '@/lib/tips';

export default function ProbBars({ probs }: { probs: Record<MoodType, number> }) {
  return (
    <div className="space-y-2.5 my-4">
      {MOOD_ORDER.map((k) => {
        const info = MOOD_CONFIG[k];
        const pct = (probs[k] * 100).toFixed(1);
        return (
          <div key={k} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-slate-700">{info.emoji} {info.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-600">{pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${info.colorClass}`} style={{ width: `${Math.max(Number(pct), 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
