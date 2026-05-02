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
}

export interface ApiError {
  detail: string;
}
