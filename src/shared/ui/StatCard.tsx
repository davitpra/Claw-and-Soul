interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E0DED9] p-5 flex items-start gap-4 shadow-sm">
      <div className="bg-primary/10 rounded-xl p-2.5 shrink-0">
        <span className="material-symbols-outlined text-primary text-[22px]">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-slate-dark font-display">
          {value.toLocaleString()}
        </p>
        <p className="text-sm font-semibold text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
