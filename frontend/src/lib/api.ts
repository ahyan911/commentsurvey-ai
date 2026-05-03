import { AnalysisResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseApiError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);

  if (data?.detail) {
    return typeof data.detail === "string"
      ? data.detail
      : JSON.stringify(data.detail);
  }

  return `Request failed with status ${response.status}`;
}

export async function analyzeComments(
  comments: string[]
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comments }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function analyzeYoutubeVideo(
  url: string,
  maxComments: number
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/analyze-youtube`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      max_comments: maxComments,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<AnalysisResult>;
}
