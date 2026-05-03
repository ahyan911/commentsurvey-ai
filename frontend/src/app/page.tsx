"use client";

import { useState } from "react";

import ResultsDashboard from "@/components/ResultsDashboard";
import Spinner from "@/components/Spinner";
import { analyzeComments, analyzeYoutubeVideo } from "@/lib/api";
import { downloadInsightsPdf } from "@/lib/pdf";
import { AnalysisResult } from "@/lib/types";

type InputMode = "manual" | "youtube";

const EXAMPLE_COMMENTS = `Yes this product is absolutely amazing! Worth every penny.
No I didn't like it, the quality was terrible and it broke after a week.
Maybe it's okay but it's a bit expensive for what you get.
Definitely yes! Best purchase I've made all year.
No way, the customer service was awful and shipping took forever.
Yes, I would totally recommend this to my friends and family.
Not sure honestly, it has pros and cons.
The design is nice though.
No, very disappointed. The description was misleading.
Yes! Works exactly as described. Very happy with my order.`;

const COMMENT_LIMITS = [25, 50, 100, 250, 500];

export default function Home() {
  const [mode, setMode] = useState<InputMode>("manual");
  const [raw, setRaw] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [maxComments, setMaxComments] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseComments = (text: string): string[] =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 2);

  const commentCount = parseComments(raw).length;

  function loadExample() {
    setRaw(EXAMPLE_COMMENTS);
    setMode("manual");
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setRaw("");
    setYoutubeUrl("");
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let data: AnalysisResult;

      if (mode === "manual") {
        const comments = parseComments(raw);

        if (comments.length < 2) {
          setError("Please enter at least 2 comments, one per line.");
          return;
        }

        data = await analyzeComments(comments);
      } else {
        if (!youtubeUrl.trim()) {
          setError("Please paste a valid YouTube video URL.");
          return;
        }

        data = await analyzeYoutubeVideo(youtubeUrl.trim(), maxComments);
      }

      setResult(data);

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const isAnalyzeDisabled =
    loading || (mode === "manual" ? !raw.trim() : !youtubeUrl.trim());

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              CommentSurvey AI
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Turn Comments into Smart Survey Insights
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Paste comments manually or analyze public YouTube video comments.
              The AI detects opinions, sentiment, themes, and creates a clean
              insight report.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
            Powered by Groq + YouTube Data API
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setMode("manual");
                setError(null);
                setResult(null);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "manual"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Paste Comments
            </button>

            <button
              onClick={() => {
                setMode("youtube");
                setError(null);
                setResult(null);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "youtube"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              YouTube URL
            </button>
          </div>

          {mode === "manual" ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Comments{" "}
                    {commentCount > 0 && (
                      <span className="ml-1 text-sm font-medium text-indigo-600">
                        {commentCount} detected
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Paste one comment per line.
                  </p>
                </div>

                <button
                  onClick={loadExample}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Load example →
                </button>
              </div>

              <textarea
                value={raw}
                onChange={(event) => setRaw(event.target.value)}
                rows={11}
                placeholder={`Paste comments here, one per line.

Example:
Yes this product is amazing!
No I didn't like it at all.
Maybe it's okay but a bit expensive.`}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          ) : (
            <div>
              <h2 className="text-base font-bold text-slate-900">
                YouTube Video Link
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Paste a public YouTube video URL. The app will fetch top-level
                comments and analyze a sample.
              </p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                <input
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                <select
                  value={maxComments}
                  onChange={(event) =>
                    setMaxComments(Number(event.target.value))
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {COMMENT_LIMITS.map((limit) => (
                    <option key={limit} value={limit}>
                      Analyze {limit.toLocaleString()} comments
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                For large videos, use smaller samples first. Higher comment
                counts can take longer because the backend fetches comments in
                pages and analyzes them in AI batches.
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzeDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing…
                </>
              ) : (
                <>⚡ Analyze {mode === "youtube" ? "YouTube" : "Comments"}</>
              )}
            </button>

            {(raw || youtubeUrl || result) && (
              <button
                onClick={handleReset}
                className="px-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </section>

        {loading && (
          <Spinner
            label={
              mode === "youtube"
                ? "Fetching YouTube comments and analyzing with AI…"
                : "Analyzing comments with AI…"
            }
          />
        )}

        {result && !loading && (
          <div id="results" className="mt-8">
            {result.source === "youtube" && (
              <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {result.thumbnail_url && (
                    <img
                      src={result.thumbnail_url}
                      alt={result.video_title ?? "YouTube video thumbnail"}
                      className="aspect-video w-full rounded-2xl object-cover sm:w-64"
                    />
                  )}

                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                      YouTube Analysis
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      {result.video_title}
                    </h2>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Total YouTube Comments
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {result.total_youtube_comments?.toLocaleString() ??
                            "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Comments Analyzed
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {result.analyzed_comments?.toLocaleString() ??
                            result.total_comments.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {result.sample_note && (
                      <p className="mt-3 text-sm text-slate-500">
                        {result.sample_note}
                      </p>
                    )}

                    {result.video_url && (
                      <a
                        href={result.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Open video →
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Export Insights
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Download a clean PDF report with the summary, themes, opinion
                  breakdown, and sentiment distribution.
                </p>
              </div>

              <button
                onClick={() => downloadInsightsPdf(result)}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Download PDF Report
              </button>
            </div>

            <ResultsDashboard result={result} />
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-slate-400">
          CommentSurvey AI · Built with Next.js, FastAPI, Groq & YouTube Data API
        </footer>
      </div>
    </main>
  );
}
