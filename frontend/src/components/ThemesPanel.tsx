interface Props {
  themes: string[];
}

const TAG_COLORS = [
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-sky-50 text-sky-700 border-sky-200",
];

export default function ThemesPanel({ themes }: Props) {
  if (!themes.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Key Themes
      </h3>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme, i) => (
          <span
            key={i}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${TAG_COLORS[i % TAG_COLORS.length]}`}
          >
            {theme}
          </span>
        ))}
      </div>
    </div>
  );
}
