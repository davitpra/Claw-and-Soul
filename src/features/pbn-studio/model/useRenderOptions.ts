import { useState } from "react";

/** Optional values to seed the render options (e.g. a style's PBN default). */
export interface RenderOptionsInit {
  showLabels?: boolean;
  fillFacets?: boolean;
  showBorders?: boolean;
  /** Scale factor applied to the generated SVG. Only the admin exposes a control. */
  sizeMultiplier?: number;
  labelFontSize?: number;
  labelFontColor?: string;
  fillOpacity?: number;
}

/**
 * Owns the SVG render options that re-generate the output without re-processing.
 * `initial` only seeds the first render (no re-sync): mount the studio after
 * the init is resolved.
 */
export function useRenderOptions(initial?: RenderOptionsInit) {
  const [showLabels, setShowLabels] = useState(initial?.showLabels ?? true);
  const [fillFacets, setFillFacets] = useState(initial?.fillFacets ?? true);
  const [showBorders, setShowBorders] = useState(initial?.showBorders ?? true);
  const [sizeMultiplier, setSizeMultiplier] = useState(
    initial?.sizeMultiplier ?? 3,
  );
  const [labelFontSize, setLabelFontSize] = useState(
    initial?.labelFontSize ?? 12,
  );
  const [labelFontColor, setLabelFontColor] = useState(
    initial?.labelFontColor ?? "#000",
  );
  const [fillOpacity, setFillOpacity] = useState(initial?.fillOpacity ?? 0.3);

  return {
    showLabels,
    fillFacets,
    showBorders,
    sizeMultiplier,
    labelFontSize,
    labelFontColor,
    fillOpacity,
    setShowLabels,
    setFillFacets,
    setShowBorders,
    setSizeMultiplier,
    setLabelFontSize,
    setLabelFontColor,
    setFillOpacity,
  };
}

export type RenderOptions = ReturnType<typeof useRenderOptions>;
