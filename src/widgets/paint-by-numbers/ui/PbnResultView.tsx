"use client";

import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";
import {
  PbnPurchaseCard,
  AccessoryUpsell,
  usePbnAccessories,
} from "@/features/pbn-purchase";
import { Carousel } from "@/shared/ui/Carousel";
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
  const { accessories, bundlePercent } = usePbnAccessories();

  return (
    <>
      {/* Result PBN */}
      <div className="relative flex flex-none items-stretch justify-center">
        <div className="relative mx-auto w-full min-w-0 overflow-hidden">
          {/* Image Post  */}
          <div className="relative mx-auto w-fit border-4 rounded-2xl bg-white border-white shadow-xl">
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
          </div>

          <div className="w-full pb-2">
            <ColorPalette
              palette={palette}
              recipes={recipes}
              showGuide={showGuide}
              onToggleGuide={onToggleGuide}
              mixingEnabled={ENABLE_MIXING_GUIDE}
              selectedColor={selectedColor}
              onSelectColor={onSelectColor}
            />
            {/* The kit and its accessories share one carousel: one full-width
                slide each. Horizontal padding leaves room for the arrows, which
                Embla renders outside the viewport. */}
            <div className="mt-4 px-5">
              <Carousel gap="gap-4" showDots>
                {/* Purchase card: appears with the result, saves on demand at buy. */}
                <div className="min-w-0 flex-[0_0_100%]">
                  <PbnPurchaseCard
                    palette={palette}
                    previewUrl={compareImgs.processed}
                    ensureSaved={ensureSaved}
                  />
                </div>
                {/* Cross-sell: generic accessories (paints, brushes…). Plain line
                    items, no coupling with the generation flow. */}
                {accessories.map((accessory) => (
                  <div
                    key={accessory.productId}
                    className="min-w-0 flex-[0_0_100%]"
                  >
                    <AccessoryUpsell
                      accessory={accessory}
                      bundlePercent={bundlePercent}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
