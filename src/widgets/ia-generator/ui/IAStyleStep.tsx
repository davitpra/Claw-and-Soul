import { useState, useEffect } from "react";
import { Style } from "@/entities/art-style/model/styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendStyle {
  id: string;
  name: string;
  displayName: string;
  isPremium: boolean;
  previewUrl: string | null;
  images: { imageUrl: string }[];
}

interface IAStyleStepProps {
  styles: Style[];
  selectedStyle: string;
  onStyleSelect: (name: string) => void;
  onBack: () => void;
  onNext: () => void;
  productRefId?: string | null;
  formatId?: string | null;
}

export function IAStyleStep({
  styles,
  selectedStyle,
  onStyleSelect,
  onBack,
  onNext,
  productRefId,
  formatId,
}: IAStyleStepProps) {
  const [compatStyles, setCompatStyles] = useState<Style[]>([]);
  const [isLoadingCompat, setIsLoadingCompat] = useState(false);

  useEffect(() => {
    if (!productRefId || !formatId) return;

    setIsLoadingCompat(true);
    fetch(
      `${API_URL}/compat/styles?product_id=${productRefId}&format_id=${formatId}`,
      { credentials: "include" },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`compat/styles error: ${res.status}`);
        return res.json() as Promise<BackendStyle[]>;
      })
      .then((data) => {
        const mapped: Style[] = data.map((s) => ({
          name: s.displayName,
          label: s.isPremium ? "Premium" : undefined,
          img:
            s.images[0]?.imageUrl ??
            s.previewUrl ??
            "https://placehold.co/400x500?text=Style",
        }));
        setCompatStyles(mapped);
        // Auto-select first if current selection no longer in the filtered list
        if (mapped.length > 0 && !mapped.find((s) => s.name === selectedStyle)) {
          onStyleSelect(mapped[0].name);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch compatible styles:", err);
      })
      .finally(() => setIsLoadingCompat(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productRefId, formatId]);

  const displayStyles =
    productRefId && formatId && compatStyles.length > 0 ? compatStyles : styles;
  const isFiltered = productRefId && formatId;

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

        {isLoadingCompat ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayStyles.map((style) => {
            const isSelected = selectedStyle === style.name;
            return (
              <div
                key={style.name}
                className="group relative cursor-pointer"
                onClick={() => onStyleSelect(style.name)}
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
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-dark/60 hover:text-slate-dark transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-primary text-white px-8 py-3.5 text-base font-bold hover:bg-primary-dark hover:scale-105 transition-all shadow-md shadow-primary/20"
          >
            Continue to Preview
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>
  );
}
