import type { CSSProperties } from "react";

/** Presentation applied to the product image based on the product type. */
export type FrameStyle = "canvas" | "poster" | "art";

// Only an explicit "Canvas"/"Poster" template gets a framed presentation; any
// other value (or an unknown one) stays flat ("art").
export function toFrameStyle(template?: string | null): FrameStyle {
  if (template === "Canvas") return "canvas";
  if (template === "Poster") return "poster";
  return "art";
}

// Per-type presentation for the product image. "art" keeps the original flat
// float; "canvas" adds a directional float (the wrap darkening is a separate
// overlay, see `canvasEdgeStyle`); "poster" adds a white paper margin with a
// hairline edge and a flatter shadow.
export const FRAME_SHADOWS: Record<FrameStyle, string> = {
  art: "shadow-[0_14px_32px_-12px_rgba(16,54,66,0.40)]",
  canvas: "shadow-[8px_10px_22px_-8px_rgba(16,54,66,0.45)]",
  poster:
    "bg-white border border-black/10 p-2 shadow-[0_8px_20px_-12px_rgba(16,54,66,0.30)]",
};

// The canvas "wrap" darkening. Box-shadow insets don't render over an <img>
// (the image content paints on top), so we overlay gradients and multiply them
// onto the artwork: darker toward the left, right and bottom edges, none at top.
export const canvasEdgeStyle: CSSProperties = {
  background: [
    "linear-gradient(to right, rgba(0,0,0,0.34), rgba(0,0,0,0) 2%, rgba(0,0,0,0) 98%, rgba(0,0,0,0.34))",
    "linear-gradient(to top, rgba(0,0,0,0.38), rgba(0,0,0,0) 1%)",
  ].join(", "),
  mixBlendMode: "multiply",
};

// Thumbnail-sized poster frame (no float shadow): a white paper margin with a
// hairline edge, for cropped contexts like the same-style gallery.
export const POSTER_THUMB_FRAME = "bg-white border border-black/10 p-1.5";
