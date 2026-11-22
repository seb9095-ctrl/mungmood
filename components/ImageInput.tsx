'use client';
import React, { useRef } from 'react';

interface Props {
  previewUrl: string | null; error: string | null; isAnalyzing: boolean;
  onFileSelect: (file: File) => void; onAnalyze: () => void;
}

export default function ImageInput({ previewUrl, error, isAnalyzing, onFileSelect, onAnalyze }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
    e.target.value = '';
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">1. Select Dog Photo</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            ● Task 1 UI Prototype
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm">
            📁 Upload Photo
          </button>
          <button type="button" onClick={() => camRef.current?.click()}
            className="py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm">
            📷 Use Camera
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={onChange} className="hidden" />
          <input ref={camRef} type="file" accept="image/jpeg,image/png" capture="environment" onChange={onChange} className="hidden" />
        </div>
        <div className="w-full aspect-square max-h-72 mx-auto rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden mb-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected dog preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-6 text-slate-400">
              <p className="text-4xl mb-2">🐶</p>
              <p className="text-sm font-medium text-slate-600">No photo selected yet</p>
              <p className="text-xs mt-1">JPEG or PNG (max 10 MB)</p>
            </div>
          )}
        </div>
        {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">⚠️ {error}</div>}
      </div>
      <div>
        <button type="button" disabled={!previewUrl || isAnalyzing} onClick={onAnalyze}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-white ${!previewUrl || isAnalyzing ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isAnalyzing ? 'Analyzing mood...' : !previewUrl ? 'Choose a photo first' : 'Analyze Mood'}
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-2">🔒 Privacy: Photos stay in your browser and are never uploaded.</p>
      </div>
    </section>
  );
}
