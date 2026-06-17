"use client";

import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";

const COLLECTION_HANDLE = "new-collection";

export default function NewCollection() {
  // 1. Producto(s) dentro de la colección Shopify "new-collection".
  const { products, isLoading: collectionLoading } =
    useCollectionProducts(COLLECTION_HANDLE);
  const productHandle = products[0]?.shopifyHandle ?? null;

  // 2. Estilo asociado a ese producto.
  const { styleId, isLoading: styleLoading } = useProductStyle(productHandle);

  // 3. styleImages de ese estilo.
  const { images, isLoading: imagesLoading, error } = useStyleImages(styleId);

  const isLoading = collectionLoading || styleLoading || imagesLoading;

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      title="New Collection"
      ctaHref={`/product/${productHandle}`}
      ctaLabel="Get my own!"
      badgeLabel="New"
      background="bg-white"
      altText={false}
    />
  );
}
