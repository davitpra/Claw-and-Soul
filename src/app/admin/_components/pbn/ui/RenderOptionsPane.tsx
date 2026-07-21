import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";
import { RenderOptions, Toggle } from "@/features/pbn-studio";
import { fieldInput, fieldLabel } from "@/features/pbn-studio/ui/pbnStyles";

interface RenderOptionsPaneProps {
  opts: RenderOptions;
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

/** Native <input type="color"> only accepts #rrggbb, so expand shorthand
 * (#rgb) and fall back to black for anything it can't parse. */
function toColorInputValue(value: string): string {
  const hex = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return "#000000";
}

export default function RenderOptionsPane({
  opts,
  palette,
  recipes,
  showGuide,
  onToggleGuide,
  mixingEnabled,
  selectedColor,
  onSelectColor,
}: RenderOptionsPaneProps) {
  const hasSelection = selectedColor !== null;
  const toggles: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }[] = [
    {
      label: "Show labels",
      checked: opts.showLabels,
      onChange: opts.setShowLabels,
    },
    {
      label: "Fill facets",
      checked: opts.fillFacets,
      onChange: opts.setFillFacets,
    },
    {
      label: "Show borders",
      checked: opts.showBorders,
      onChange: opts.setShowBorders,
    },
  ];

  return (
    <section className="mt-6 rounded-xl border border-[#E0DED9] bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h4 className="font-display text-lg font-black text-slate-dark">
          Render options
        </h4>
        <p className="font-body text-sm text-text-muted">
          Tweak the SVG output — changes apply without reprocessing.
        </p>
      </header>

      <div className="flex flex-wrap gap-6">
        {toggles.map((t) => (
          <Toggle
            key={t.label}
            checked={t.checked}
            onChange={t.onChange}
            label={t.label}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>SVG size multiplier</span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            value={opts.sizeMultiplier}
            onChange={(e) =>
              opts.setSizeMultiplier(parseInt(e.target.value) || 1)
            }
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Label size</span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            max={40}
            value={opts.labelFontSize}
            onChange={(e) =>
              opts.setLabelFontSize(parseInt(e.target.value) || 1)
            }
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Label color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="size-9 shrink-0 cursor-pointer rounded-lg border border-primary/40 bg-white p-0.5"
              value={toColorInputValue(opts.labelFontColor)}
              onChange={(e) => opts.setLabelFontColor(e.target.value)}
            />
            <input
              type="text"
              className={fieldInput}
              value={opts.labelFontColor}
              onChange={(e) => opts.setLabelFontColor(e.target.value)}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${fieldLabel} justify-between`}>
            Fill opacity
            <span className="font-bold normal-case text-primary">
              {Math.round(opts.fillOpacity * 100)}%
            </span>
          </span>
          <input
            type="range"
            className="w-full accent-primary"
            min={0}
            max={100}
            value={Math.round(opts.fillOpacity * 100)}
            onChange={(e) =>
              opts.setFillOpacity((parseInt(e.target.value) || 0) / 100)
            }
          />
        </label>
      </div>

      <div className="mt-6">
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
                className={`flex size-9 items-center justify-center rounded-md border text-xs font-bold text-white mix-blend-difference transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-1 scale-105"
                    : "border-black/10"
                } ${hasSelection && !isSelected ? "opacity-45" : ""}`}
                style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }}
                title={`#${i} · rgb(${c[0]}, ${c[1]}, ${c[2]})`}
                aria-pressed={isSelected}
                onClick={() => onSelectColor(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <p className="mt-2 font-body text-xs text-text-muted">
          Click a color to highlight its sections in the preview.
        </p>
      </div>

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
