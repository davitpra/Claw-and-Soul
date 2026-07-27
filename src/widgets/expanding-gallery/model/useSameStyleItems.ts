"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useSameStyleProducts } from "@/hooks/useSameStyleProducts";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";
import {
  ART_KIND_LABELS,
  resolveArtKind,
  type ArtKind,
} from "@/entities/product/model/artKind";
import type { ExpandingGalleryItem } from "../ui/ExpandingGallery";

/** Ejes del producto actual con los que se buscan sus hermanos. */
interface SameStyleSource {
  template?: string | null;
  artKind?: string | null;
}

/** Título de la sección, que nombra el tipo de obra cuando se conoce. */
export function sameStyleGalleryTitle(artKind: ArtKind | null): string {
  return artKind
    ? `More ${ART_KIND_LABELS[artKind]} in this style`
    : "More in this style";
}

/**
 * Productos que comparten estilo y tipo de obra con el actual, ya mapeados a
 * items del acordeón.
 *
 * Los dos ejes: el estilo lo filtra `useSameStyleProducts`, y el artKind acá,
 * porque desde un coloreable no interesa el arte terminado del mismo estilo
 * —eso ya lo vende `PrintedOption`— ni al revés. Los productos legacy sin
 * artKind entran igual: `resolveArtKind` lo deduce del template a los dos
 * lados de la comparación.
 *
 * Vive aparte de `SameStyleGallery` para que el padre pueda decidir si la
 * sección se muestra: `ExpandingGallery` se oculta solo cuando no hay items, y
 * un `SectionFlow` que ya repartió colores no puede enterarse de eso.
 */
export function useSameStyleItems(
  handle?: string | null,
  current?: SameStyleSource,
) {
  const { styleId, styleName } = useProductStyle(handle ?? null);
  const { products, isLoading, error } = useSameStyleProducts(styleId, handle);

  const artKind = resolveArtKind(current?.template, current?.artKind);

  // Sin un artKind resoluble no se filtra: mejor la lista de solo-estilo que
  // una sección vacía. El filtro va antes del cap para que los tres cupos no
  // se los coma el otro tipo de obra.
  const matching = artKind
    ? products.filter((p) => resolveArtKind(p.template, p.artKind) === artKind)
    : products;

  // Con un solo hermano el acordeón sigue valiendo la pena: ExpandingGallery
  // expande ese panel a todo el ancho. Solo se oculta si no hay ninguno.
  const items: ExpandingGalleryItem[] =
    isLoading || error
      ? []
      : matching.slice(0, 3).map((p) => ({
          title: p.name,
          description: p.desc || undefined,
          cta: "View product",
          href: `/product/${p.shopifyHandle}`,
          imageUrl: p.img,
          imageAlt: p.name,
          tags: [p.template].filter((tag): tag is string => Boolean(tag)),
          frameStyle: toFrameStyle(p.template),
        }));

  return { items, styleName, artKind, isLoading, error };
}
