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
