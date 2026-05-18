"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";

interface StyleCollectionProps {
  handle?: string | null;
  styleId?: string | null;
}

export default function StyleCollection({ handle, styleId: styleIdProp }: StyleCollectionProps) {
  const { styleId: derivedStyleId, isLoading: styleLoading } = useProductStyle(
    styleIdProp ? null : (handle ?? null)
  );

  const resolvedStyleId = styleIdProp ?? derivedStyleId;
  const { images, isLoading: imagesLoading, error } = useStyleImages(resolvedStyleId);

  const isLoading = (styleIdProp ? false : styleLoading) || imagesLoading;
  const title = "Other pets in this style";

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
