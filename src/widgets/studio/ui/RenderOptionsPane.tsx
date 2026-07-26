import { RenderOptions, Toggle } from "@/features/pbn-studio";
import Modal from "@/shared/ui/Modal";
import {
  btnPrimary,
  fieldInput,
  fieldLabel,
} from "@/features/pbn-studio/ui/pbnStyles";

interface RenderOptionsPaneProps {
  opts: RenderOptions;
  /** Controlled by the parent (opened from the post's ⋯ menu). */
  open: boolean;
  onClose: () => void;
  /**
   * El SVG en pantalla vino de un PBN guardado (`?pbnId=…`), no del pipeline: no
   * hay `ProcessResult` con el que repintarlo, así que los controles se bloquean
   * y el panel ofrece regenerar en su lugar.
   */
  locked: boolean;
  isProcessing: boolean;
  onGenerate: () => void;
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

/** Advanced render controls shown in a Modal. Opened from the post's ⋯ menu
 * ("Settings"); the parent owns the open/close state. */
export default function RenderOptionsPane({
  opts,
  open,
  onClose,
  locked,
  isProcessing,
  onGenerate,
}: RenderOptionsPaneProps) {
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
    <Modal
      open={open}
      onClose={onClose}
      title="Render options"
      maxWidth="max-w-lg"
      label="Render options"
    >
      <div className="p-6">
        {locked && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-cream p-4">
            <span className="material-symbols-outlined shrink-0 text-primary">
              info
            </span>
            <div className="min-w-0">
              <p className="font-body text-sm text-text-main">
                This painting was loaded from your saved copy, so these options
                can&apos;t redraw it yet. Generate it again to unlock them.
              </p>
              <button
                type="button"
                className={`${btnPrimary} mt-3`}
                onClick={onGenerate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Generating…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Los controles siguen a la vista para que se entienda qué se desbloquea,
            pero inertes: sin `ProcessResult` mover uno no repinta nada y encima
            ensuciaría el estado de guardado (ver `markDirty` en Studio). */}
        <div className={locked ? "pointer-events-none opacity-60" : undefined}>
          <div className="flex flex-wrap gap-6">
            {toggles.map((t) => (
              <Toggle
                key={t.label}
                checked={t.checked}
                onChange={t.onChange}
                label={t.label}
                disabled={locked}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Label size</span>
              <input
                type="number"
                className={fieldInput}
                min={1}
                max={40}
                disabled={locked}
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
                  disabled={locked}
                  value={toColorInputValue(opts.labelFontColor)}
                  onChange={(e) => opts.setLabelFontColor(e.target.value)}
                />
                <input
                  type="text"
                  className={fieldInput}
                  disabled={locked}
                  value={opts.labelFontColor}
                  onChange={(e) => opts.setLabelFontColor(e.target.value)}
                />
              </div>
            </label>
          </div>

          <label className="mt-5 flex flex-col gap-1.5">
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
              disabled={locked}
              value={Math.round(opts.fillOpacity * 100)}
              onChange={(e) =>
                opts.setFillOpacity((parseInt(e.target.value) || 0) / 100)
              }
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
