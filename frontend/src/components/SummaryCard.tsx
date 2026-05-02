interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          AI Summary
        </h3>
      </div>
      <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
    </div>
  );
}
