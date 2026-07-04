import { useState } from "react";

/** Optional saved values to seed the render options (rehydration on reopen). */
export interface RenderOptionsInit {
  showLabels?: boolean;
  fillFacets?: boolean;
  showBorders?: boolean;
  sizeMultiplier?: number;
  labelFontSize?: number;
  labelFontColor?: string;
  fillOpacity?: number;
}

/** Owns the SVG render options that re-generate the output without re-processing. */
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
  const [fillOpacity, setFillOpacity] = useState(initial?.fillOpacity ?? 1);

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
