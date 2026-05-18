"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";

interface StyleCollectionProps {
  handle: string;
}

export default function StyleCollection({ handle }: StyleCollectionProps) {
  const {
    styleId,
    styleName,
    isLoading: styleLoading,
  } = useProductStyle(handle);

  const {
    images,
    isLoading: imagesLoading,
    error,
  } = useStyleImages(styleId);

  const isLoading = styleLoading || imagesLoading;
  const title = styleName ? `Más en estilo ${styleName}` : "Más en este estilo";

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      title={title}
      ctaHref="/ia-generator"
      ctaLabel="Ver más estilos"
    />
  );
}
