import { RGB } from "./common";
import { FacetCreator } from "./facetCreator";
import { FacetResult } from "./facetmanagement";
import { buildFacetLabel, buildFacetPathData } from "./guiprocessmanager";

const XMLNS = "http://www.w3.org/2000/svg";

export interface HighlightOverlayOptions {
  showBorders: boolean;
  showLabels: boolean;
  fontSize: number;
  fontColor: string;
  /** Border width in the overlay's 1× coordinate space. Pass 1/sizeMultiplier so
   *  the redrawn border visually matches the (multiplied) base image's 1px stroke.
   *  Defaults to 0.33 (the widget's 3× multiplier). */
  strokeWidth?: number;
}

/**
 * Builds an SVG data URL that spotlights one color's sections. It overlays only
 * the facets of the chosen color, painted at their true palette color (100%),
 * with the border and number redrawn on top so they stay visible over the solid
 * fill. Every other facet is left out of the overlay (fully transparent), so the
 * base image — and all its other numbers — shows through untouched.
 *
 * The SVG uses the same width/height/viewBox as the processed output (at 1×), so
 * it lines up when the compare slider scales it via CSS.
 */
export function buildHighlightOverlayDataUrl(
  facetResult: FacetResult,
  colorIndex: number,
  palette: RGB[],
  opts: HighlightOverlayOptions,
): string {
  const { width, height, facets } = facetResult;
  const strokeWidth = opts.strokeWidth ?? 0.33;
  const svg = document.createElementNS(XMLNS, "svg");
  svg.setAttribute("width", width + "");
  svg.setAttribute("height", height + "");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  for (const f of facets) {
    if (f == null || f.color !== colorIndex) continue;
    const data = buildFacetPathData(f);
    if (data == null) continue;

    const c = palette[f.color];

    // Solid fill at 100% — this is the highlight.
    const fillPath = document.createElementNS(XMLNS, "path");
    fillPath.setAttribute("d", data);
    fillPath.style.stroke = "none";
    fillPath.style.fill = `rgb(${c[0]},${c[1]},${c[2]})`;

    // A facet only stores its outer contour, so a ring-shaped facet's fill
    // would also cover the other-color facets enclosed inside it. Punch those
    // neighbours out with a mask so the base image shows through the holes.
    // Directly enclosed neighbours also cover any deeper nested facets, and
    // outside neighbours only touch along the shared border (same geometry).
    if (f.neighbourFacetsIsDirty) {
      FacetCreator.buildFacetNeighbour(f, facetResult);
    }
    const holes: string[] = [];
    for (const idx of f.neighbourFacets!) {
      const n = facets[idx];
      if (n == null || n.color === colorIndex) continue;
      // Skip neighbours whose bbox contains ours: they surround us (or wrap
      // around us), and punching their outer contour would erase our own fill.
      if (
        n.bbox.minX <= f.bbox.minX &&
        n.bbox.minY <= f.bbox.minY &&
        n.bbox.maxX >= f.bbox.maxX &&
        n.bbox.maxY >= f.bbox.maxY
      ) {
        continue;
      }
      const holeData = buildFacetPathData(n);
      if (holeData != null) holes.push(holeData);
    }
    if (holes.length > 0) {
      const maskId = `hl-mask-${f.id}`;
      const mask = document.createElementNS(XMLNS, "mask");
      mask.setAttribute("id", maskId);
      const keep = document.createElementNS(XMLNS, "path");
      keep.setAttribute("d", data);
      keep.setAttribute("fill", "#fff");
      mask.appendChild(keep);
      for (const holeData of holes) {
        const hole = document.createElementNS(XMLNS, "path");
        hole.setAttribute("d", holeData);
        hole.setAttribute("fill", "#000");
        mask.appendChild(hole);
      }
      svg.appendChild(mask);
      fillPath.setAttribute("mask", `url(#${maskId})`);
    }
    svg.appendChild(fillPath);

    // The solid fill would cover the base image's border, so redraw it here.
    if (opts.showBorders) {
      const strokePath = document.createElementNS(XMLNS, "path");
      strokePath.setAttribute("d", data);
      strokePath.style.fill = "none";
      strokePath.style.strokeWidth = `${strokeWidth}px`;
      strokePath.style.stroke = "#000";
      svg.appendChild(strokePath);
    }

    // Keep the number readable on top of the full-color fill.
    if (opts.showLabels) {
      svg.appendChild(buildFacetLabel(f, opts.fontSize, opts.fontColor));
    }
  }

  const serialized = new XMLSerializer().serializeToString(svg);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
}
