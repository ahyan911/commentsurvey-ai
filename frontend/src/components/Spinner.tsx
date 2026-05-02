export default function Spinner({ label = "Analyzing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
    </div>
  );
}
