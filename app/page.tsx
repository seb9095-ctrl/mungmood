'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageInput from '@/components/ImageInput';
import ResultCard from '@/components/ResultCard';
import { analyzeDogMoodDemo } from '@/lib/model';
import { PredictionResult } from '@/lib/postprocess';
import { MOOD_CONFIG, MOOD_ORDER } from '@/lib/tips';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onSelect = (f: File) => {
    setError(null); setResult(null);
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setError('Please upload a JPEG or PNG image.');
    if (f.size > 10 * 1024 * 1024) return setError('File must be under 10 MB.');
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try { setResult(await analyzeDogMoodDemo(file)); }
    catch { setError('Analysis failed.'); }
    finally { setLoading(false); }
  };

  const onReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setResult(null); setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl text-indigo-600">🐶 MungMood</Link>
          <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">About Model</Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">How is your dog feeling?</h1>
          <p className="text-slate-600 text-sm sm:text-base mb-4">Upload a photo of your dog to predict its mood and get tailored care advice.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {MOOD_ORDER.map((m) => (
              <span key={m} className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200">
                {MOOD_CONFIG[m].emoji} {MOOD_CONFIG[m].label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageInput previewUrl={preview} error={error} isAnalyzing={loading} onFileSelect={onSelect} onAnalyze={onAnalyze} />
          <ResultCard isAnalyzing={loading} result={result} onReset={onReset} />
        </div>
        <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">📸 Photo Tips & Disclaimer</p>
          <p>Use a clear photo of one dog facing the camera. For informational reference only, not veterinary diagnosis.</p>
        </div>
      </main>
    </div>
  );
}
