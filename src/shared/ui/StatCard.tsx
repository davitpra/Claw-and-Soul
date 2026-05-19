interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, icon, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm border transition-all ${
        highlight
          ? "border-primary ring-1 ring-primary/20 bg-primary/5"
          : "border-[#E0DED9]"
      }`}
    >
      <div className={`rounded-xl p-2.5 shrink-0 ${highlight ? "bg-primary/15" : "bg-primary/10"}`}>
        <span className="material-symbols-outlined text-primary text-[22px]">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-slate-dark font-display">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-semibold text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
