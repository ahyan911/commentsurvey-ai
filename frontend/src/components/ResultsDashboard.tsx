import { AnalysisResult } from "@/lib/types";
import StatCard from "./StatCard";
import OpinionChart from "./OpinionChart";
import SentimentChart from "./SentimentChart";
import ThemesPanel from "./ThemesPanel";
import SummaryCard from "./SummaryCard";

interface Props {
  result: AnalysisResult;
}

export default function ResultsDashboard({ result }: Props) {
  // Determine dominant sentiment label
  const dominant =
    result.sentiment.positive >= result.sentiment.negative &&
    result.sentiment.positive >= result.sentiment.neutral
      ? "Positive"
      : result.sentiment.negative >= result.sentiment.neutral
      ? "Negative"
      : "Mixed";

  const dominantAccent =
    dominant === "Positive" ? "green" : dominant === "Negative" ? "red" : "slate";

  return (
    <section className="mt-10 space-y-6 animate-[fadeIn_0.4s_ease]">
      {/* Top stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Comments"
          value={String(result.total_comments)}
          accent="indigo"
        />
        <StatCard
          label="Yes / Agree"
          value={`${result.yes_percentage}%`}
          accent="green"
        />
        <StatCard
          label="No / Disagree"
          value={`${result.no_percentage}%`}
          accent="red"
        />
        <StatCard
          label="Dominant Mood"
          value={dominant}
          accent={dominantAccent as any}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OpinionChart result={result} />
        <SentimentChart result={result} />
      </div>

      {/* Themes */}
      <ThemesPanel themes={result.themes} />

      {/* AI Summary */}
      <SummaryCard summary={result.summary} />
    </section>
  );
}
