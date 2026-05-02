interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red" | "slate" | "indigo";
}

const accentMap: Record<string, string> = {
  green:  "text-green-600",
  red:    "text-red-500",
  slate:  "text-slate-500",
  indigo: "text-indigo-600",
};

export default function StatCard({ label, value, sub, accent = "indigo" }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-3xl font-bold ${accentMap[accent]}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}
