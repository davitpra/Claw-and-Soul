"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useSameStyleProducts } from "@/hooks/useSameStyleProducts";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";
import type { ExpandingGalleryItem } from "../ui/ExpandingGallery";

/**
 * Productos que comparten estilo con el actual, ya mapeados a items del
 * acordeón.
 *
 * Vive aparte de `SameStyleGallery` para que el padre pueda decidir si la
 * sección se muestra: `ExpandingGallery` se oculta solo cuando no hay items, y
 * un `SectionFlow` que ya repartió colores no puede enterarse de eso.
 */
export function useSameStyleItems(handle?: string | null) {
  const { styleId, styleName } = useProductStyle(handle ?? null);
  const { products, isLoading, error } = useSameStyleProducts(styleId, handle);

  // Con un solo hermano el acordeón sigue valiendo la pena: ExpandingGallery
  // expande ese panel a todo el ancho. Solo se oculta si no hay ninguno.
  const items: ExpandingGalleryItem[] =
    isLoading || error
      ? []
      : products.slice(0, 3).map((p) => ({
          title: p.name,
          description: p.desc || undefined,
          cta: "View product",
          href: `/product/${p.shopifyHandle}`,
          imageUrl: p.img,
          imageAlt: p.name,
          tags: [p.template].filter((tag): tag is string => Boolean(tag)),
          frameStyle: toFrameStyle(p.template),
        }));

  return { items, styleName, isLoading, error };
}
