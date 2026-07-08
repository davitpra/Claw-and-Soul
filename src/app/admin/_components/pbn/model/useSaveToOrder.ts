import { useCallback, useState } from "react";
import { adminApi } from "@/entities/admin/api";
import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";

interface SaveToOrderArgs {
  orderId: string;
  itemId: string;
  /** Container holding the rendered <svg> (outline with numbers). */
  svgContainerRef: React.RefObject<HTMLDivElement | null>;
  /** The on-screen mixing-guide node, captured as the palette PNG. */
  guideRef: React.RefObject<HTMLDivElement | null>;
  /** Colored preview PNG data URL (compareImgs.processed). */
  previewDataUrl?: string;
  /** Original source image data URL. */
  sourceDataUrl?: string | null;
  palette: RGB[];
  recipes: MixRecipe[] | null;
  /** JSON-serializable settings snapshot to reproduce the PBN. */
  config: Record<string, unknown>;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Admin counterpart of the storefront `useSavePbn`: serializes the studio's
 * rendered artifacts (SVG + preview + palette + source) and config, then POSTs
 * them via `adminApi.orders.savePbnForItem` so the PBN persists and links to
 * the order item (origin 'admin').
 */
export function useSaveToOrder() {
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (args: SaveToOrderArgs): Promise<{ id: string } | null> => {
      setSaving(true);
      setError(null);
      setSavedOk(false);
      try {
        const svg = args.svgContainerRef.current?.querySelector("svg");
        if (!svg) {
          throw new Error("Procesa una imagen antes de guardar");
        }

        const form = new FormData();
        form.append(
          "svg",
          new Blob([svg.outerHTML], { type: "image/svg+xml" }),
          "outline.svg",
        );
        if (args.previewDataUrl) {
          form.append(
            "preview",
            await dataUrlToBlob(args.previewDataUrl),
            "preview.png",
          );
        }
        if (args.sourceDataUrl) {
          form.append(
            "source",
            await dataUrlToBlob(args.sourceDataUrl),
            "source.png",
          );
        }
        if (args.guideRef.current && args.recipes && args.palette.length > 0) {
          try {
            const { toBlob } = await import("html-to-image");
            const paletteBlob = await toBlob(args.guideRef.current, {
              backgroundColor: "#ffffff",
              pixelRatio: 2,
              cacheBust: true,
              skipFonts: true,
            });
            if (paletteBlob) form.append("palette", paletteBlob, "palette.png");
          } catch {
            // Palette is optional — never block the save on it.
          }
        }

        form.append(
          "config",
          JSON.stringify({ ...args.config, palette: args.palette }),
        );

        const saved = await adminApi.orders.savePbnForItem(
          args.orderId,
          args.itemId,
          form,
        );
        setSavedOk(true);
        return saved;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo guardar el PBN",
        );
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { save, saving, savedOk, error };
}
