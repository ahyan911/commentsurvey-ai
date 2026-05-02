"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { AnalysisResult } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  result: AnalysisResult;
}

export default function SentimentChart({ result }: Props) {
  const { sentiment } = result;

  const data = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "% of Comments",
        data: [sentiment.positive, sentiment.negative, sentiment.neutral],
        backgroundColor: ["#22c55e99", "#ef444499", "#94a3b899"],
        borderColor: ["#16a34a", "#dc2626", "#64748b"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (v: any) => `${v}%`,
          font: { size: 12 },
        },
        grid: { color: "#f1f5f9" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 13 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.raw}% of comments`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Sentiment Distribution
      </h3>
      <div className="relative h-56">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
