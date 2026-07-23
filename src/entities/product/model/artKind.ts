// Eje "contenido" de un producto de arte, independiente de su formato de
// entrega (template Digital | Canvas | Poster): "pbn" es un coloreable para
// pintar y "print" es arte terminado listo para colgar. El valor vive en el
// backend (ProductReference.artKind) y llega vacío si no está asignado.
export type ArtKind = "pbn" | "print";

export const ART_KIND_ORDER: ArtKind[] = ["pbn", "print"];

// User-facing copy (storefront is in English).
export const ART_KIND_LABELS: Record<ArtKind, string> = {
  pbn: "Paint by Numbers",
  print: "Print Art",
};

/** Label visible para un artKind; undefined si el valor falta o no es conocido. */
export function artKindLabel(value?: string | null): string | undefined {
  return value && value in ART_KIND_LABELS
    ? ART_KIND_LABELS[value as ArtKind]
    : undefined;
}
