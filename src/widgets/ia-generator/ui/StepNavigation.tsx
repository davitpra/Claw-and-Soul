interface StepNavigationProps {
  onNext: () => void;
  nextLabel?: string;
  onBack?: () => void;
  disableNext?: boolean;
}

export function StepNavigation({
  onNext,
  nextLabel = "Continue",
  onBack,
  disableNext = false,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-2">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-dark/60 hover:text-slate-dark transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={disableNext}
        className="flex items-center gap-2 rounded-xl bg-primary text-white px-8 py-3.5 text-base font-bold hover:bg-primary-dark hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {nextLabel}
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  );
}
