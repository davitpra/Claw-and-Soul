import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";

interface ColorPaletteProps {
  palette: RGB[];
  recipes: MixRecipe[] | null;
  showGuide: boolean;
  onToggleGuide: () => void;
  /** When false the "See mixing guide" toggle is hidden (feature-flagged). */
  mixingEnabled: boolean;
  /** Index of the color whose sections are highlighted, or null. */
  selectedColor: number | null;
  /** Click a swatch to highlight/unhighlight its sections in the preview. */
  onSelectColor: (index: number) => void;
}

export default function ColorPalette({
  palette,
  recipes,
  showGuide,
  onToggleGuide,
  mixingEnabled,
  selectedColor,
  onSelectColor,
}: ColorPaletteProps) {
  const hasSelection = selectedColor !== null;
  return (
    <section className="mt-6 rounded-xl border border-[#E0DED9] bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <strong className="font-display font-black text-slate-dark">
          Color palette
        </strong>
        <span className="font-body text-sm text-text-muted">
          {palette.length} colors
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {palette.map((c, i) => {
          const isSelected = selectedColor === i;
          return (
            <button
              key={i}
              type="button"
              className={`flex size-9 items-center justify-center rounded-md border text-xs font-bold transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary ring-offset-1 scale-105"
                  : "border-black/10"
              } ${hasSelection && !isSelected ? "opacity-45" : ""}`}
              style={{
                backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})`,
              }}
              title={`#${i} · rgb(${c[0]}, ${c[1]}, ${c[2]})`}
              aria-pressed={isSelected}
              onClick={() => onSelectColor(i)}
            >
              <span className="text-white mix-blend-difference">{i + 1}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-body text-xs text-text-muted">
        Click a color to highlight its sections in the preview.
      </p>
      {mixingEnabled && recipes && palette.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-dark"
            onClick={onToggleGuide}
            aria-expanded={showGuide}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showGuide ? "expand_more" : "chevron_right"}
            </span>
            See mixing guide ({recipes.length} colors)
          </button>
        </div>
      )}
    </section>
  );
}
