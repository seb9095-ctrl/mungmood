import Link from 'next/link';
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl text-indigo-600">🐶 MungMood</Link>
          <Link href="/" className="text-sm font-semibold text-indigo-600">← Back to Analyzer</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4 text-sm text-slate-700">
        <h1 className="text-2xl font-extrabold text-slate-900">About the MungMood AI Model</h1>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-1">Dataset & Model</h2>
          <p>MobileNetV3-Large fine-tuned on Dog_Emotion_Dataset_v2 (4,000 images: sad, angry, relaxed, happy), running in-browser via ONNX Runtime Web (WASM).</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-1">Limitations</h2>
          <p>Relaxed and sad expressions may overlap. Task 1 displays a labeled demo placeholder until model training completes in Task 2–3.</p>
        </div>
      </main>
    </div>
  );
}
