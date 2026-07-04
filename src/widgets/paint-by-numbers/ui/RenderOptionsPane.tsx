import { RenderOptions } from "../model/useRenderOptions";
import { Toggle } from "./controls";
import { fieldInput, fieldLabel } from "./pbnStyles";

interface RenderOptionsPaneProps {
  opts: RenderOptions;
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

export default function RenderOptionsPane({ opts }: RenderOptionsPaneProps) {
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
    </section>
  );
}
