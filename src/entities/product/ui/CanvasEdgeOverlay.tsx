import { canvasEdgeStyle, canvasHighlightStyle } from "@/entities/product/lib/frameStyle";

// Two stacked overlays for the canvas presentation: a `multiply` layer that
// darkens the left/right/bottom edges, plus a `screen` highlight along the top.
// They can't be one element — multiply can't lighten and screen can't darken.
// Render inside a `position: relative` container.
export function CanvasEdgeOverlay() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={canvasEdgeStyle}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={canvasHighlightStyle}
      />
    </>
  );
}
