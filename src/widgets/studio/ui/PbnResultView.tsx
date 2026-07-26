"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";
import {
  PbnPurchaseCard,
  AccessoryUpsell,
  usePbnAccessories,
} from "@/features/pbn-purchase";
import { Carousel } from "@/shared/ui/Carousel";
import ImageCompareSlider from "@/shared/ui/ImageCompareSlider";
import { ENABLE_MIXING_GUIDE } from "@/features/pbn-studio";
import { btnSecondary } from "@/features/pbn-studio/ui/pbnStyles";
import type { SavedPbnRef } from "../model/useSavePbnFlow";
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
  /** El guardado falló por el tope de obras guardadas: el aviso lleva atajo. */
  limitReached: boolean;
  palette: RGB[];
  recipes: MixRecipe[] | null;
  showGuide: boolean;
  onToggleGuide: () => void;
  selectedColor: number | null;
  onSelectColor: (i: number) => void;
  /** El resultado viene de un PBN guardado: sin pipeline no hay resaltado. */
  renderLocked: boolean;
  onDownload: () => void;
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
  limitReached,
  palette,
  recipes,
  showGuide,
  onToggleGuide,
  selectedColor,
  onSelectColor,
  renderLocked,
  onDownload,
  ensureSaved,
}: PbnResultViewProps) {
  const { accessories, bundlePercent } = usePbnAccessories();
  const postRef = useRef<HTMLDivElement>(null);

  // El aviso de error del guardado vive sobre la imagen; desde la card de compra
  // (más abajo en el scroll) "Add to cart" fallaría en mudo, así que traemos el
  // post a la vista cuando el guardado on-demand no resuelve.
  const ensureSavedInView = useCallback(async () => {
    const saved = await ensureSaved();
    if (!saved) {
      postRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return saved;
  }, [ensureSaved]);

  return (
    <>
      {/* Result PBN */}
      <div className="relative flex flex-none items-stretch justify-center">
        <div className="relative mx-auto w-full min-w-0 overflow-hidden">
          {/* Image Post  */}
          <div
            ref={postRef}
            className="relative mx-auto w-fit border-4 rounded-2xl bg-white border-white shadow-xl"
          >
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
                  <Link href="/user/pbn" className="font-semibold underline">
                    View my Paint by Numbers
                  </Link>
                </p>
              </div>
            )}
            {saveError && (
              <p
                role="alert"
                className="absolute bottom-3 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-xl bg-white/90 px-4 py-1.5 text-center font-body text-sm text-red-600 shadow-md backdrop-blur"
              >
                {saveError}
                {limitReached && (
                  <>
                    {" "}
                    <Link
                      href="/user/pbn"
                      className="font-semibold text-primary underline"
                    >
                      Manage my paintings
                    </Link>
                  </>
                )}
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
              selectionDisabled={renderLocked}
            />
            {/* Atajo de descarga sólo en móvil: ahí el mismo botón del sidebar
                queda detrás de la hoja inferior de ajustes, así que se repite
                bajo el resultado. En escritorio el sidebar ya está a la vista.
                `md:hidden` es el mismo corte que `useIsMobile`. Este componente
                sólo se monta con un resultado listo, así que no hace falta
                comprobar `hasOutput` ni `isProcessing`. */}
            <div className="mt-4 px-5 md:hidden">
              <button className={`${btnSecondary} w-full`} onClick={onDownload}>
                <span className="material-symbols-outlined">download</span>
                Download
              </button>
            </div>
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
                    source={{
                      kind: "saved-pbn",
                      ensureSaved: ensureSavedInView,
                    }}
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
