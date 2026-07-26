import { RGB } from "@/lib/pbn/common";
import { ClusteringColorSpace } from "@/lib/pbn/settings";
import type { InputOptionsInit, PaletteMode } from "./useInputOptions";

const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;
const bool = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;
const colors = (v: unknown): RGB[] =>
  Array.isArray(v)
    ? (v.filter((c) => Array.isArray(c) && c.length >= 3) as RGB[])
    : [];

/**
 * `PbnConfig.input` viene guardado en dos formas según la superficie que lo
 * persistió:
 *
 * - **admin** (`AdminPbnStudio`): los valores crudos del hook, o sea ya
 *   `InputOptionsInit` — se devuelve tal cual.
 * - **storefront** (`useSavePbnFlow`): `inputOptions.buildSettings()`, es decir
 *   un `Settings` del pipeline (`kMeansNrOfClusters`, `resizeImageWidth`, …),
 *   cuyas claves no coinciden con las del hook.
 *
 * Esta función normaliza ambas a `InputOptionsInit` para poder sembrar
 * `useInputOptions` al reabrir un PBN guardado. Los campos ausentes se omiten
 * (nunca `undefined` explícito): el init se mezcla con los defaults de la
 * superficie con spread, y una clave a `undefined` los pisaría.
 */
export function settingsToInputInit(
  input: Record<string, unknown> | null | undefined,
): InputOptionsInit | undefined {
  if (!input || typeof input !== "object") return undefined;

  // `kMeansNrOfClusters` es el marcador de la forma `Settings`: si no está, la
  // config ya son valores del hook.
  if (!("kMeansNrOfClusters" in input)) return input as InputOptionsInit;

  const entries: InputOptionsInit = {
    resizeImage: bool(input.resizeImageIfTooLarge),
    resizeWidth: num(input.resizeImageWidth),
    resizeHeight: num(input.resizeImageHeight),
    nrOfClusters: num(input.kMeansNrOfClusters),
    clusterPrecision: num(input.kMeansMinDeltaDifference),
    randomSeed: num(input.randomSeed),
    colorSpace: num(input.kMeansClusteringColorSpace) as
      | ClusteringColorSpace
      | undefined,
    narrowPixelCleanupRuns: num(input.narrowPixelStripCleanupRuns),
    removeFacetsSmallerThan: num(input.removeFacetsSmallerThanNrOfPoints),
    maximumNumberOfFacets: num(input.maximumNumberOfFacets),
    largeToSmall: bool(input.removeFacetsFromLargeToSmall),
    halveBorderSegments: num(input.nrOfTimesToHalveBorderSegments),
  };

  const pinned = colors(input.kMeansPinnedColors);
  if (pinned.length > 0) {
    entries.pickedColors = pinned;
    // Espeja la rama de `buildSettings`: en modo exacto la paleta son solo los
    // colores elegidos, así que no quedan candidatos negro/blanco.
    const mode: PaletteMode =
      colors(input.kMeansFixedColors).length === 0 ? "exact" : "complement";
    entries.paletteMode = mode;
  }

  // El panel edita las restricciones como texto: una línea `r,g,b` por color.
  const restrictions = colors(input.kMeansColorRestrictions);
  if (restrictions.length > 0) {
    entries.colorRestrictions = restrictions
      .map((c) => `${c[0]},${c[1]},${c[2]}`)
      .join("\n");
  }

  // Quitar las claves sin valor: van a mezclarse con los defaults por spread.
  return Object.fromEntries(
    Object.entries(entries).filter(([, v]) => v !== undefined),
  ) as InputOptionsInit;
}
