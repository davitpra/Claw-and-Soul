import { OverallStatus } from "../model/constants";

export default function ProgressBar({ overall }: { overall: OverallStatus }) {
  if (overall.state === "idle") return null;
  const pct = Math.round(overall.progress * 100);
  return (
    <div className="my-4">
      <div className="mb-1.5 flex items-center justify-between font-body text-sm text-text-muted">
        <span>{overall.label}</span>
        <span className="font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            overall.state === "complete" ? "bg-primary" : "bg-primary/80"
          }`}
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}
