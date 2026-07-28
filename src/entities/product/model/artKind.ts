// Eje "contenido" de un producto de arte, independiente de su formato de
// entrega (template Digital | Canvas | Poster): "pbn" es un coloreable para
// pintar y "print" es arte terminado listo para colgar. Su fuente de verdad es
// el metafield `custom.art_kind` de Shopify; el sync lo baja a
// ProductReference.artKind y de ahí llega al front, vacío si no está asignado.
import { normalizeTemplate } from "../lib/template";

export type ArtKind = "pbn" | "print";

export const ART_KIND_ORDER: ArtKind[] = ["pbn", "print"];

// User-facing copy (storefront is in English).
export const ART_KIND_LABELS: Record<ArtKind, string> = {
  pbn: "Paint by Numbers",
  print: "Print Art",
};

// El metafield de Shopify guarda labels humanos ("PBN", "Print art"); el sync
// del backend los baja normalizados, pero cuando el valor llega directo de la
// Storefront API (las referencias de custom.alternative_products) hay que
// traducirlos acá o `resolveArtKind` los descartaría y caería al template.
const ART_KIND_ALIASES: Record<string, ArtKind> = {
  pbn: "pbn",
  "paint by numbers": "pbn",
  print: "print",
  "print art": "print",
};

/** Art kind normalizado desde cualquiera de sus escrituras; null si no se reconoce. */
export function normalizeArtKind(value?: string | null): ArtKind | null {
  return ART_KIND_ALIASES[value?.trim().toLowerCase() ?? ""] ?? null;
}

/** Label visible para un artKind; undefined si el valor falta o no es conocido. */
export function artKindLabel(value?: string | null): string | undefined {
  return value && value in ART_KIND_LABELS
    ? ART_KIND_LABELS[value as ArtKind]
    : undefined;
}

// Art kind derivado del template para los productos legacy: antes de que el
// metafield existiera, el formato de entrega alcanzaba para saber qué había
// dentro (los físicos coloreables se vendían como póster, el canvas era arte
// terminado). Un template desconocido no se adivina.
const ART_KIND_BY_TEMPLATE: Record<string, ArtKind> = {
  Digital: "pbn",
  Poster: "pbn",
  Canvas: "print",
};

/**
 * Art kind efectivo de un producto: el que asignó el backend o, si falta, el
 * que se deduce del template. Devuelve null cuando no hay forma de saberlo
 * (sin artKind y con un template vacío o desconocido).
 *
 * Es la única tabla de derivación del front: la comparten el gate de los
 * bloques de pintura (`isPaintableProduct`) y el filtro de la galería de mismo
 * estilo, que necesitan tratar igual a los productos legacy de los dos lados.
 */
export function resolveArtKind(
  template?: string | null,
  artKind?: string | null,
): ArtKind | null {
  return (
    normalizeArtKind(artKind) ??
    ART_KIND_BY_TEMPLATE[normalizeTemplate(template)] ??
    null
  );
}
