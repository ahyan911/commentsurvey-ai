"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { AnalysisResult } from "@/lib/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  result: AnalysisResult;
}

export default function OpinionChart({ result }: Props) {
  const data = {
    labels: ["Yes / Agree", "No / Disagree", "Neutral"],
    datasets: [
      {
        data: [
          result.yes_percentage,
          result.no_percentage,
          result.neutral_percentage,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#94a3b8"],
        borderColor: ["#16a34a", "#dc2626", "#64748b"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          font: { size: 13 },
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Opinion Poll
      </h3>
      <div className="relative h-56">
        <Doughnut data={data} options={options} />
      </div>
      {/* Centre label */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <span className="font-semibold text-green-600">
          {result.yes_percentage}% Yes
        </span>
        <span className="font-semibold text-red-500">
          {result.no_percentage}% No
        </span>
      </div>
    </div>
  );
}
