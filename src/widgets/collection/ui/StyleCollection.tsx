"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import CollectionSection from "./CollectionSection";

interface StyleCollectionProps {
  handle?: string | null;
  styleId?: string | null;
  showCta?: boolean;
}

export default function StyleCollection({
  handle,
  styleId: styleIdProp,
}: StyleCollectionProps) {
  const {
    styleId: derivedStyleId,
    styleName,
    isLoading: styleLoading,
  } = useProductStyle(styleIdProp ? null : (handle ?? null));

  const resolvedStyleId = styleIdProp ?? derivedStyleId;
  const {
    images,
    isLoading: imagesLoading,
    error,
  } = useStyleImages(resolvedStyleId);

  const isLoading = (styleIdProp ? false : styleLoading) || imagesLoading;
  const title = "Minimalist Art Styles";

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      title={title}
      eyebrow={styleName}
      description={
        styleName
          ? `Our ${styleName} style captures your pet's unique personality with elegant, hand-illustrated detail and a timeless finish.`
          : null
      }
    />
  );
}
