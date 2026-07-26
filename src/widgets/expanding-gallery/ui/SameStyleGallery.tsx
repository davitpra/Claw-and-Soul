"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useSameStyleProducts } from "@/hooks/useSameStyleProducts";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";
import ExpandingGallery, { ExpandingGalleryItem } from "./ExpandingGallery";

interface SameStyleGalleryProps {
  /** Handle de Shopify del producto actual; se excluye de los resultados. */
  handle?: string | null;
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Muestra en el acordeón `ExpandingGallery` los productos que comparten
 * estilo con el producto actual. Es un wrapper delgado: resuelve el estilo
 * con `useProductStyle`, los productos con `useSameStyleProducts` y delega
 * el render en el componente presentacional.
 */
export default function SameStyleGallery({
  handle,
  eyebrow,
  title = "More in this style",
  description,
}: SameStyleGalleryProps) {
  const { styleId, styleName } = useProductStyle(handle ?? null);
  const { products, isLoading, error } = useSameStyleProducts(styleId, handle);

  // Con un solo hermano el acordeón sigue valiendo la pena: ExpandingGallery
  // expande ese panel a todo el ancho. Solo se oculta si no hay ninguno.
  if (isLoading || error || products.length === 0) return null;

  const items: ExpandingGalleryItem[] = products.slice(0, 3).map((p) => ({
    title: p.name,
    description: p.desc || undefined,
    cta: "View product",
    href: `/product/${p.shopifyHandle}`,
    imageUrl: p.img,
    imageAlt: p.name,
    tags: [p.template].filter((tag): tag is string => Boolean(tag)),
    frameStyle: toFrameStyle(p.template),
  }));

  return (
    <ExpandingGallery
      eyebrow={eyebrow ?? styleName ?? "Same style"}
      title={title}
      description={description}
      items={items}
    />
  );
}
