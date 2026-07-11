"use client";

import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";
import { PbnPurchaseCard } from "@/features/pbn-purchase";
import { ENABLE_MIXING_GUIDE } from "../model/constants";
import type { SavedPbnRef } from "../model/useSavePbnFlow";
import ImageCompareSlider from "./ImageCompareSlider";
import PbnPostHeader from "./PbnPostHeader";
import { PbnPostMenuItem } from "./PbnPostMenu";
import ColorPalette from "./ColorPalette";

interface PbnResultViewProps {
  compareImgs: { original: string; processed: string };
  highlightSrc?: string;
  menuItems: PbnPostMenuItem[];
  saving: boolean;
  savedId: string | null;
  saveError: string | null;
  palette: RGB[];
  recipes: MixRecipe[] | null;
  showGuide: boolean;
  onToggleGuide: () => void;
  selectedColor: number | null;
  onSelectColor: (i: number) => void;
  ensureSaved: () => Promise<SavedPbnRef | null>;
}

/**
 * The processed result presented as an Instagram-style post: the before/after
 * compare slider with an avatar/menu header overlay, followed by an action row,
 * the palette "caption" and the purchase card. Rendered in place of the
 * input/dropzone once processing yields a result.
 */
export default function PbnResultView({
  compareImgs,
  highlightSrc,
  menuItems,
  saving,
  savedId,
  saveError,
  palette,
  recipes,
  showGuide,
  onToggleGuide,
  selectedColor,
  onSelectColor,
  ensureSaved,
}: PbnResultViewProps) {
  return (
    <>
      {/* Result PBN */}
      <div className="relative flex flex-none items-stretch justify-center">
        <div className="relative mx-auto w-fit max-w-full overflow-hidden ">
          {/* Image Post  */}
          <div className="relative rounded-2xl border-4 bg-white border-white shadow-xl">
            {/* mx-auto flex h-full w-fit justify-center overflow-hidden rounded-xl border-4 bg-white border-white shadow-xl */}
            <PbnPostHeader menuItems={menuItems} />
            <ImageCompareSlider
              originalSrc={compareImgs.original}
              processedSrc={compareImgs.processed}
              highlightSrc={highlightSrc}
              leftLabel="Original"
              rightLabel="Result"
              framed={false}
            />

            {savedId && (
              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 shadow-md backdrop-blur">
                <p className="font-body text-sm text-background-dark">
                  Saved.{" "}
                  <a href="/user/pbn" className="font-semibold underline">
                    View my Paint by Numbers
                  </a>
                </p>
              </div>
            )}
            {saveError && (
              <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 font-body text-sm text-red-600 shadow-md backdrop-blur">
                {saveError}
              </p>
            )}
            {/* Post footer on the same card: action row + palette as "caption". */}
            {/* <div className="w-full flex items-center gap-1 px-2 pt-2">
              {menuItems
                .filter((i) => !i.hidden)
                .map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    title={item.label}
                    aria-label={item.label}
                    className="flex size-10 items-center justify-center rounded-full text-slate-dark transition-colors hover:bg-cream disabled:opacity-50"
                    disabled={item.label !== "Settings" && saving}
                  >
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        saving && item.icon === "bookmark_add"
                          ? "animate-spin"
                          : ""
                      }`}
                    >
                      {saving && item.icon === "bookmark_add"
                        ? "progress_activity"
                        : item.icon}
                    </span>
                  </button>
                ))}
            </div> */}
          </div>

          <div className="w-0 min-w-full pb-2">
            <ColorPalette
              palette={palette}
              recipes={recipes}
              showGuide={showGuide}
              onToggleGuide={onToggleGuide}
              mixingEnabled={ENABLE_MIXING_GUIDE}
              selectedColor={selectedColor}
              onSelectColor={onSelectColor}
            />
            {/* Purchase card: appears with the result, saves on demand at buy. */}
            <PbnPurchaseCard
              palette={palette}
              previewUrl={compareImgs.processed}
              ensureSaved={ensureSaved}
            />
          </div>
        </div>
      </div>
    </>
  );
}
