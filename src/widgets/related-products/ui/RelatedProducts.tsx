"use client";

import { Product } from "@/entities/pet-product/model/types";
import { CollectionSection } from "@/widgets/collection";

interface RelatedProductsProps {
  /** Productos ya resueltos (p. ej. de `getRelatedProducts`). */
  products: Product[];
  /** Título editorial; admite saltos de línea con `\n`. */
  heading?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

/**
 * Sección de productos relacionados sobre fondo cream, reutilizando el
 * carrusel de CollectionSection (mismas cards, ratio y sombra que la
 * colección de estilos). Cada card enlaza al detalle del producto y muestra
 * nombre, formato y precio alineados a la izquierda.
 */
export default function RelatedProducts({
  products,
  heading = "More souls,\nframed.",
  ctaHref = "/shop",
  ctaLabel = "View all styles",
}: RelatedProductsProps) {
  const cardId = (product: Product) =>
    product.productRefId ?? product.shopifyHandle ?? product.name;

  const images = products.map((product) => ({
    id: cardId(product),
    imageUrl: product.img,
    altImage: product.name,
  }));
  const productById = new Map(products.map((p) => [cardId(p), p]));

  return (
    <CollectionSection
      images={images}
      isLoading={false}
      error={null}
      title={heading}
      background="bg-white"
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      getHref={(image) => {
        const handle = productById.get(image.id)?.shopifyHandle;
        return handle ? `/product/${handle}` : undefined;
      }}
      renderFooter={(image) => {
        const product = productById.get(image.id);
        if (!product) return null;
        return (
          <div className="flex flex-col items-start gap-0.5">
            <h3 className="font-display font-black text-slate-dark md:text-lg">
              {product.name}
            </h3>
            {product.tag && (
              <p className="text-sm text-text-muted">{product.tag}</p>
            )}
            <p className="text-sm font-bold text-text-main">{product.price}</p>
          </div>
        );
      }}
    />
  );
}
