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
  /**
   * El overlay de resaltado se construye desde el `ProcessResult` del pipeline;
   * con un PBN cargado desde su copia guardada no lo hay, así que los swatches
   * quedan a la vista (son la paleta de la obra) pero sin acción.
   */
  selectionDisabled: boolean;
}

export default function ColorPalette({
  palette,
  recipes,
  showGuide,
  onToggleGuide,
  mixingEnabled,
  selectedColor,
  onSelectColor,
  selectionDisabled,
}: ColorPaletteProps) {
  const hasSelection = selectedColor !== null;
  const showGuideButton = mixingEnabled && recipes && palette.length > 0;
  return (
    <section className="mt-6 rounded-xl  bg-white p-6 shadow-sm mx-4">
      <strong className="font-display font-black text-slate-dark">
        Color palette ({palette.length})
      </strong>
      <p className="text-sm text-slate-500">
        {selectionDisabled
          ? "Generate this painting again to highlight a color's sections."
          : "Click a color to highlight its sections in the preview."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-1 flex-wrap gap-2">
          {palette.map((c, i) => {
            const isSelected = selectedColor === i;
            return (
              <button
                key={i}
                type="button"
                className={`flex size-11 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
                    : "border-black/10"
                } ${hasSelection && !isSelected ? "opacity-45" : ""} ${
                  selectionDisabled ? "cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})`,
                }}
                title={`#${i} · rgb(${c[0]}, ${c[1]}, ${c[2]})`}
                aria-pressed={isSelected}
                disabled={selectionDisabled}
                onClick={() => onSelectColor(i)}
              >
                <span className="text-white mix-blend-difference">{i + 1}</span>
              </button>
            );
          })}
        </div>
        {showGuideButton && (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E0DED9] py-3 font-semibold text-primary transition-colors hover:text-primary-dark sm:w-auto sm:border-0 sm:py-0"
            onClick={onToggleGuide}
            aria-expanded={showGuide}
          >
            See mixing guide
            <span className="material-symbols-outlined order-first text-[20px] sm:order-last">
              open_in_new
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
