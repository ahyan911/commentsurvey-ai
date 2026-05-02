import { AnalysisResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * POST /api/analyze
 * Sends comment array to FastAPI backend, returns structured analysis.
 */
export async function analyzeComments(
  comments: string[]
): Promise<AnalysisResult> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comments }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<AnalysisResult>;
}
