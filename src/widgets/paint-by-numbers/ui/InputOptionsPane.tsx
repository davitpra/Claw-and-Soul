import { useState } from "react";
import { ClusteringColorSpace } from "@/lib/pbn/settings";
import { PRESETS } from "../model/constants";
import { InputOptions } from "../model/useInputOptions";
import { HelpTip, Segmented, Toggle } from "./controls";
import PalettePicker from "./PalettePicker";
import { fieldInput, fieldLabel } from "./pbnStyles";

const COLOR_SPACES: { value: ClusteringColorSpace; label: string }[] = [
  { value: ClusteringColorSpace.RGB, label: "RGB" },
  { value: ClusteringColorSpace.HSL, label: "HSL" },
  { value: ClusteringColorSpace.LAB, label: "Lab" },
];

const groupTitle = "text-xs font-bold uppercase tracking-wide text-text-muted";

export default function InputOptionsPane({
  opts,
  imageSrc,
}: {
  opts: InputOptions;
  imageSrc: string | null;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const colorCountLocked =
    opts.pickedColors.length > 0 && opts.paletteMode === "exact";

  return (
    <div className="flex flex-col gap-6">
      {/* Presets */}
      <div className="flex flex-col gap-2 mt-4">
        <span className={groupTitle}>Presets</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = opts.isPresetActive(p.apply);
            return (
              <button
                key={p.key}
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "border border-[#E0DED9] bg-white text-slate-dark hover:bg-gray-50"
                }`}
                onClick={() => opts.applyPreset(p.apply)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors — palette picker + number of colors */}
      <div className="flex flex-col gap-4">
        <span className={groupTitle}>Colors</span>
        <label
          className="flex flex-col gap-1.5"
          style={{ opacity: colorCountLocked ? 0.5 : 1 }}
          aria-disabled={colorCountLocked}
        >
          <span className={fieldLabel}>
            Number of colors
            <HelpTip
              text={
                colorCountLocked
                  ? "Locked: in “Only my colors” mode the palette size equals the number of colors you picked."
                  : "How many distinct colors the final palette will contain."
              }
            />
          </span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            disabled={colorCountLocked}
            value={
              colorCountLocked ? opts.pickedColors.length : opts.nrOfClusters
            }
            onChange={(e) =>
              opts.setNrOfClusters(parseInt(e.target.value) || 1)
            }
          />
        </label>
        <PalettePicker opts={opts} imageSrc={imageSrc} />
      </div>

      {/* Shapes — region cleanup */}
      <div className="flex flex-col gap-4">
        <span className={groupTitle}>Shapes</span>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>
            Remove areas smaller than (px)
            <HelpTip text="Regions with fewer pixels than this are merged into their neighbors to remove tiny specks." />
          </span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            value={opts.removeFacetsSmallerThan}
            onChange={(e) =>
              opts.setRemoveFacetsSmallerThan(parseInt(e.target.value) || 1)
            }
          />
        </label>
      </div>

      {/* Advanced settings */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 self-start font-semibold text-primary transition-colors hover:text-primary-dark"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((v) => !v)}
        >
          <span className="material-symbols-outlined text-[20px]">
            {advancedOpen ? "expand_more" : "chevron_right"}
          </span>
          Advanced settings
        </button>

        {advancedOpen && (
          <>
            {/* Image — resize / max dimensions */}
            <div className="flex flex-col gap-4">
              <span className={groupTitle}>Image</span>
              <Toggle
                checked={opts.resizeImage}
                onChange={opts.setResizeImage}
                label="Resize large images"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label
                  className="flex flex-col gap-1.5"
                  style={{ opacity: opts.resizeImage ? 1 : 0.5 }}
                  aria-disabled={!opts.resizeImage}
                >
                  <span className={fieldLabel}>
                    Max width (px)
                    <HelpTip text="Large images are scaled down so their width doesn't exceed this, which speeds up processing." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={1}
                    disabled={!opts.resizeImage}
                    value={opts.resizeWidth}
                    onChange={(e) =>
                      opts.setResizeWidth(parseInt(e.target.value) || 0)
                    }
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5"
                  style={{ opacity: opts.resizeImage ? 1 : 0.5 }}
                  aria-disabled={!opts.resizeImage}
                >
                  <span className={fieldLabel}>
                    Max height (px)
                    <HelpTip text="Large images are scaled down so their height doesn't exceed this, which speeds up processing." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={1}
                    disabled={!opts.resizeImage}
                    value={opts.resizeHeight}
                    onChange={(e) =>
                      opts.setResizeHeight(parseInt(e.target.value) || 0)
                    }
                  />
                </label>
              </div>
            </div>
            {/* Advanced · Colors */}
            <div className="flex flex-col gap-4">
              <span className={fieldLabel}>Colors</span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>
                    Grouping precision
                    <HelpTip text="How tightly colors are grouped before the algorithm stops. Lower values are more precise but slower." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={1}
                    step={0.05}
                    value={opts.clusterPrecision}
                    onChange={(e) =>
                      opts.setClusterPrecision(parseFloat(e.target.value) || 1)
                    }
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>
                    Random seed
                    <HelpTip text="Starting value for the random initialization. The same seed always produces the same result." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={0}
                    step={1}
                    value={opts.randomSeed}
                    onChange={(e) =>
                      opts.setRandomSeed(parseInt(e.target.value) || 0)
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={fieldLabel}>
                  Color comparison model
                  <HelpTip text="Color space used to measure how similar two colors are: RGB, HSL or Lab (Lab matches human perception best)." />
                </span>
                <Segmented
                  name="colorspace"
                  options={COLOR_SPACES}
                  value={opts.colorSpace}
                  onChange={opts.setColorSpace}
                />
              </div>
            </div>

            {/* Advanced · Shapes */}
            <div className="flex flex-col gap-4">
              <span className={fieldLabel}>Shapes</span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>
                    Cleanup passes
                    <HelpTip text="How many times the cleanup runs. Each pass removes thin one-pixel strips between areas for cleaner, more consistent borders." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={0}
                    value={opts.narrowPixelCleanupRuns}
                    onChange={(e) =>
                      opts.setNarrowPixelCleanupRuns(
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>
                    Max # of areas
                    <HelpTip text="Upper limit on how many separate regions are generated." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={1}
                    value={opts.maximumNumberOfFacets}
                    onChange={(e) =>
                      opts.setMaximumNumberOfFacets(
                        parseInt(e.target.value) || 1,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>
                    Border smoothing
                    <HelpTip text="How many times each region border is simplified. More passes give smoother, less jagged edges." />
                  </span>
                  <input
                    type="number"
                    className={fieldInput}
                    min={0}
                    value={opts.halveBorderSegments}
                    onChange={(e) =>
                      opts.setHalveBorderSegments(parseInt(e.target.value) || 0)
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={fieldLabel}>
                  Area removal order
                  <HelpTip text="Whether small-region removal starts from the largest regions or the smallest first." />
                </span>
                <Segmented
                  name="facetremovalorder"
                  options={[
                    { value: "large", label: "Largest first" },
                    { value: "small", label: "Smallest first" },
                  ]}
                  value={opts.largeToSmall ? "large" : "small"}
                  onChange={(v) => opts.setLargeToSmall(v === "large")}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
