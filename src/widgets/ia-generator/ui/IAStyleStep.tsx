import { Style } from "@/entities/art-style/model/styles";

interface IAStyleStepProps {
  styles: Style[];
  selectedStyle: Style | null;
  onStyleSelect: (style: Style) => void;
  onBack?: () => void;
  onNext: () => void;
  isLoading?: boolean;
  error?: string | null;
  isFiltered?: boolean;
}

export function IAStyleStep({
  styles,
  selectedStyle,
  onStyleSelect,
  onBack,
  onNext,
  isLoading = false,
  error = null,
  isFiltered = false,
}: IAStyleStepProps) {
  console.log("styles", styles);
  return (
    <main className="grow px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
            Choose Your Art Style
          </h1>
          <p className="text-slate-dark/70 text-lg">
            {isFiltered
              ? "Showing styles compatible with your selected product and size."
              : "Pick the style that best fits your vision."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-semibold">
            {error}
          </div>
        ) : styles.length === 0 ? (
          <div className="text-center py-12 text-slate-dark/60 font-semibold">
            {isFiltered
              ? "No compatible styles available for this product and size."
              : "No styles available."}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {styles.map((style) => {
              const isSelected = selectedStyle?.name === style.name;
              return (
                <div
                  key={style.id ?? style.name}
                  className="group relative cursor-pointer"
                  onClick={() => onStyleSelect(style)}
                >
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 z-20 bg-primary text-white rounded-full p-1.5 shadow-md animate-in zoom-in duration-300">
                      <span className="material-symbols-outlined text-lg block">
                        check
                      </span>
                    </div>
                  )}
                  <div
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-lg"
                        : "border-transparent"
                    }`}
                  >
                    <div className="aspect-4/5 w-full overflow-hidden bg-slate-100">
                      <img
                        alt={style.name}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-90 group-hover:opacity-100"
                        }`}
                        src={style.img}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                      {style.label && (
                        <span className="block text-[10px] font-bold opacity-90 uppercase tracking-widest mb-0.5">
                          {style.label}
                        </span>
                      )}
                      <span className="block text-base font-bold leading-tight">
                        {style.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold text-slate-dark/60 hover:text-slate-dark transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={onNext}
            disabled={!selectedStyle || isLoading || styles.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary text-white px-8 py-3.5 text-base font-bold hover:bg-primary-dark hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue to Preview
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>
  );
}
