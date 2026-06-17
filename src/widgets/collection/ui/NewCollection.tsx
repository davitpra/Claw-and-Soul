"use client";

import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";

export default function NewCollection() {
  const { images, isLoading, error } = useStyleImages();

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      title="Last Collection"
      ctaHref="/ia-generator"
      ctaLabel="Ver colección completa"
      badgeLabel="Nuevo"
      background="bg-white"
      altText={false}
    />
  );
}
