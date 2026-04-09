"use client";

import { FormatOption } from "@/hooks/useFormatOptions";

interface FormatSelectorProps {
  formats: FormatOption[];
  selectedFormatId: string | null;
  onFormatSelect: (format: FormatOption) => void;
  isLoading: boolean;
  error: string | null;
}

export function FormatSelector({
  formats,
  selectedFormatId,
  onFormatSelect,
  isLoading,
  error,
}: FormatSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        <span className="material-symbols-outlined text-lg">error</span>
        <span>{error}</span>
      </div>
    );
  }

  if (formats.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
        <span className="material-symbols-outlined text-lg">info</span>
        <span>No available sizes for this product right now.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {formats.map((format) => {
        const isSelected = selectedFormatId === format.formatId;
        const price = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: format.currencyCode,
        }).format(parseFloat(format.price));

        return (
          <button
            key={format.formatId}
            onClick={() => onFormatSelect(format)}
            className={`relative flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-slate-200 bg-white hover:border-primary/40"
            }`}
          >
            {isSelected && (
              <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-lg">
                check_circle
              </span>
            )}

            <span className="text-xs font-bold text-slate-dark/50 uppercase tracking-widest">
              {format.aspectRatio}
            </span>

            <span className="text-base font-black text-slate-dark leading-tight">
              {format.displayName}
            </span>

            <span className="text-sm text-slate-dark/60 leading-none">
              {format.width} × {format.height} px
            </span>

            <span className="mt-1 text-lg font-black text-primary">
              {price}
            </span>
          </button>
        );
      })}
    </div>
  );
}
