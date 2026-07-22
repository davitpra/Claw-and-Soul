import { useCallback, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";

interface SavePbnArgs {
  /** Container holding the rendered <svg> (the outline with numbers). */
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
  /** Optional source AI generation this PBN was derived from. */
  generationId?: string | null;
}

interface SavedPbn {
  id: string;
  [key: string]: unknown;
}

/** Turns a data URL into a Blob for multipart upload. */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Serializes the client-rendered PBN artifacts (SVG + preview + palette +
 * source) and the config, then POSTs them as multipart to the backend so the
 * PBN can be listed and later ordered. Requires an authenticated session.
 */
export function useSavePbn() {
  const { authFetchJSON } = useAuthFetch();
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (args: SavePbnArgs): Promise<SavedPbn | null> => {
      setSaving(true);
      setError(null);
      try {
        const svg = args.svgContainerRef.current?.querySelector("svg");
        if (!svg) {
          throw new Error("Procesa una imagen antes de guardar");
        }

        const form = new FormData();

        // Outline SVG (master, required).
        form.append(
          "svg",
          new Blob([svg.outerHTML], { type: "image/svg+xml" }),
          "outline.svg",
        );

        // Colored preview PNG.
        if (args.previewDataUrl) {
          form.append(
            "preview",
            await dataUrlToBlob(args.previewDataUrl),
            "preview.png",
          );
        }

        // Source image.
        if (args.sourceDataUrl) {
          form.append(
            "source",
            await dataUrlToBlob(args.sourceDataUrl),
            "source.png",
          );
        }

        // Palette / mixing guide PNG (best-effort; captured from the DOM node).
        if (args.guideRef.current && args.recipes && args.palette.length > 0) {
          try {
            const { toBlob } = await import("html-to-image");
            const paletteBlob = await toBlob(args.guideRef.current, {
              backgroundColor: "#ffffff",
              pixelRatio: 2,
              cacheBust: true,
              skipFonts: true,
            });
            if (paletteBlob) {
              form.append("palette", paletteBlob, "palette.png");
            }
          } catch {
            // Palette is optional — never block the save on it.
          }
        }

        form.append(
          "config",
          JSON.stringify({ ...args.config, palette: args.palette }),
        );
        form.append("colorCount", String(args.palette.length));
        if (args.generationId) {
          form.append("generationId", args.generationId);
        }

        const res = await authFetchJSON<{ data: SavedPbn }>(
          "/paint-by-numbers",
          { method: "POST", body: form },
        );
        const saved = res.data;
        setSavedId(saved.id);
        return saved;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar el PBN";
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [authFetchJSON],
  );

  return { save, saving, savedId, error };
}
