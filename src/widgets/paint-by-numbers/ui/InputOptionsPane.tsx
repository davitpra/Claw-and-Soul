import { useState } from "react";
import { ClusteringColorSpace } from "@/lib/pbn/settings";
import { PRESETS } from "../model/constants";
import { InputOptions } from "../model/useInputOptions";
import { HelpTip, Segmented, Toggle } from "./controls";
import { fieldInput, fieldLabel } from "./pbnStyles";

const COLOR_SPACES: { value: ClusteringColorSpace; label: string }[] = [
  { value: ClusteringColorSpace.RGB, label: "RGB" },
  { value: ClusteringColorSpace.HSL, label: "HSL" },
  { value: ClusteringColorSpace.LAB, label: "Lab" },
];

const groupTitle =
  "text-xs font-semibold uppercase tracking-wide text-text-muted";

export default function InputOptionsPane({ opts }: { opts: InputOptions }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Presets */}
      <div className="flex flex-col gap-2">
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

      {/* Custom */}
      <div className="flex flex-col gap-4">
        <span className={groupTitle}>Custom</span>
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
              Maximum width (px)
              <HelpTip text="Large images are scaled down so their width doesn't exceed this, which speeds up processing." />
            </span>
            <input
              type="number"
              className={fieldInput}
              min={1}
              disabled={!opts.resizeImage}
              value={opts.resizeWidth}
              onChange={(e) => opts.setResizeWidth(parseInt(e.target.value) || 0)}
            />
          </label>
          <label
            className="flex flex-col gap-1.5"
            style={{ opacity: opts.resizeImage ? 1 : 0.5 }}
            aria-disabled={!opts.resizeImage}
          >
            <span className={fieldLabel}>
              Maximum height (px)
              <HelpTip text="Large images are scaled down so their height doesn't exceed this, which speeds up processing." />
            </span>
            <input
              type="number"
              className={fieldInput}
              min={1}
              disabled={!opts.resizeImage}
              value={opts.resizeHeight}
              onChange={(e) => opts.setResizeHeight(parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>
              Number of colors
              <HelpTip text="How many distinct colors the final palette will contain." />
            </span>
            <input
              type="number"
              className={fieldInput}
              min={1}
              value={opts.nrOfClusters}
              onChange={(e) => opts.setNrOfClusters(parseInt(e.target.value) || 1)}
            />
          </label>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>
                  Color grouping precision
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
                  onChange={(e) => opts.setRandomSeed(parseInt(e.target.value) || 0)}
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

            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>
                Limit palette to these colors
                <HelpTip text="Restricts the palette to only the listed colors — each region snaps to the nearest one. Leave empty for no restriction." />
              </span>
              <span className="text-xs text-text-muted">
                one r,g,b per line — use // to comment
              </span>
              <textarea
                className={`${fieldInput} min-h-24 font-mono`}
                value={opts.colorRestrictions}
                onChange={(e) => opts.setColorRestrictions(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>
                  Thin pixel strip cleanup
                  <HelpTip text="Number of passes that remove narrow one-pixel-wide strips between regions for cleaner borders." />
                </span>
                <input
                  type="number"
                  className={fieldInput}
                  min={0}
                  value={opts.narrowPixelCleanupRuns}
                  onChange={(e) =>
                    opts.setNarrowPixelCleanupRuns(parseInt(e.target.value) || 0)
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>
                  Maximum number of areas
                  <HelpTip text="Upper limit on how many separate regions are generated." />
                </span>
                <input
                  type="number"
                  className={fieldInput}
                  min={1}
                  value={opts.maximumNumberOfFacets}
                  onChange={(e) =>
                    opts.setMaximumNumberOfFacets(parseInt(e.target.value) || 1)
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
          </>
        )}
      </div>
    </div>
  );
}
