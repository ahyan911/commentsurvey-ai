export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
}

export interface AnalysisResult {
  yes_percentage: number;
  no_percentage: number;
  neutral_percentage: number;
  sentiment: SentimentBreakdown;
  themes: string[];
  summary: string;
  total_comments: number;

  source?: "manual" | "youtube";
  video_id?: string;
  video_title?: string;
  video_url?: string;
  thumbnail_url?: string;
  total_youtube_comments?: number;
  analyzed_comments?: number;
  sample_note?: string;
}

export interface ApiError {
  detail: string;
}
