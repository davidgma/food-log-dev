/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, FileBox } from 'lucide-react';

export default function App() {
  const [inputDir, setInputDir] = useState('./data');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputDir }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <FileBox className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Static Site Generator</h1>
          <p className="text-slate-500">Transform your diet & grocery documents into a static website.</p>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="inputDir" className="block text-sm font-medium text-slate-700 mb-1">
                Input Directory Path
              </label>
              <input
                id="inputDir"
                type="text"
                value={inputDir}
                onChange={(e) => setInputDir(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="./data"
              />
              <p className="text-xs text-slate-500 mt-2">
                Path relative to the project root where your markdown and PDF files are located.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {loading ? 'Generating...' : 'Generate Site'}
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {result.success ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <div>
                <h4 className="font-semibold">{result.success ? 'Success!' : 'Error generating site'}</h4>
                <p className="text-sm mt-1 opacity-90">{result.success ? result.message : result.error}</p>
                {result.success && (
                  <a
                    href="/preview"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Generated Site
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
        
        {result?.success && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium text-slate-700 text-sm">Preview window (index.html)</h3>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              </div>
            </div>
            <iframe src="/preview" className="w-full flex-1 border-0 bg-white" title="Generated Site Preview"></iframe>
          </section>
        )}
      </div>
    </div>
  );
}
