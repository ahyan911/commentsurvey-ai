"use client";

import { useState } from "react";
import { analyzeComments } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";
import ResultsDashboard from "@/components/ResultsDashboard";
import Spinner from "@/components/Spinner";

// Example comments users can load with one click
const EXAMPLE_COMMENTS = `Yes this product is absolutely amazing! Worth every penny.
No I didn't like it, the quality was terrible and it broke after a week.
Maybe it's okay but it's a bit expensive for what you get.
Definitely yes! Best purchase I've made all year.
No way, the customer service was awful and shipping took forever.
Yes, I would totally recommend this to my friends and family.
Not sure honestly, it has pros and cons. The design is nice though.
No, very disappointed. The description was misleading.
Yes! Works exactly as described. Very happy with my order.
Neutral on this one - it does the job but nothing special.
Absolutely yes, game changer for me!
No, I returned it. Didn't meet my expectations at all.`;

export default function Home() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse textarea into array of non-empty lines
  const parseComments = (text: string): string[] =>
    text.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);

  const commentCount = parseComments(raw).length;

  async function handleAnalyze() {
    setError(null);
    setResult(null);

    const comments = parseComments(raw);
    if (comments.length < 2) {
      setError("Please enter at least 2 comments (one per line).");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeComments(comments);
      setResult(data);
      // Scroll results into view
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    setRaw(EXAMPLE_COMMENTS);
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setRaw("");
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-sm tracking-tight">
              CommentSurvey AI
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            Powered by GPT-4o mini
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Turn Comments into Insights
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Paste social media comments below — one per line. The AI will classify
            opinions, detect sentiment, extract themes, and generate a full report.
          </p>
        </div>

        {/* ── Input card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">
              Comments
              {commentCount > 0 && (
                <span className="ml-2 text-xs font-normal text-indigo-500">
                  {commentCount} detected
                </span>
              )}
            </label>
            <button
              onClick={loadExample}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              Load example →
            </button>
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            placeholder={`Paste comments here, one per line. Example:\n\nYes this product is amazing!\nNo I didn't like it at all.\nMaybe it's okay but a bit expensive.`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-y transition"
          />

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !raw.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Comments
                </>
              )}
            </button>

            {(result || raw) && (
              <button
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Spinner / Results ── */}
        {loading && <Spinner label="Analyzing comments with AI…" />}

        {result && !loading && (
          <div id="results">
            <ResultsDashboard result={result} />
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-16 text-center text-xs text-slate-400">
          CommentSurvey AI · Built with Next.js, FastAPI & GPT-4o mini
        </footer>
      </div>
    </main>
  );
}
