"use client";

import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";
import { DIFFICULTY_LABELS } from "@/entities/art-style/model/difficulty";

const COLLECTION_HANDLE = "new-collection";

export default function NewCollection() {
  // 1. Producto(s) dentro de la colección Shopify "new-collection".
  const {
    products,
    description,
    isLoading: collectionLoading,
  } = useCollectionProducts(COLLECTION_HANDLE);
  const productHandle = products[0]?.shopifyHandle ?? null;

  // 2. Estilo asociado a ese producto.
  const {
    styleId,
    styleName,
    difficulty,
    isLoading: styleLoading,
  } = useProductStyle(productHandle);

  // 3. styleImages de ese estilo.
  const { images, isLoading: imagesLoading, error } = useStyleImages(styleId);

  const isLoading = collectionLoading || styleLoading || imagesLoading;

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      title={"Their portrait.\nYour brushstrokes."}
      eyebrow={styleName}
      description={description}
      ctaHref={`/product/${productHandle}`}
      ctaLabel="Paint yours!"
      badgeLabel={difficulty ? DIFFICULTY_LABELS[difficulty] : undefined}
      background="bg-white"
      altText={false}
    />
  );
}
