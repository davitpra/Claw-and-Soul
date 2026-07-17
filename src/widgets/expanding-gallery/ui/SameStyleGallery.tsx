"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useSameStyleProducts } from "@/hooks/useSameStyleProducts";
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

  // El acordeón necesita al menos 2 paneles para tener sentido visual.
  if (isLoading || error || products.length < 2) return null;

  const items: ExpandingGalleryItem[] = products.slice(0, 3).map((p) => ({
    title: p.name,
    description: p.desc || undefined,
    cta: "View product",
    href: `/product/${p.shopifyHandle}`,
    imageUrl: p.img,
    imageAlt: p.name,
    tags: [p.template].filter((tag): tag is string => Boolean(tag)),
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
