"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";
import type { FrameStyle } from "@/entities/product/lib/frameStyle";
import CollectionSection from "./CollectionSection";

interface StyleCollectionProps {
  handle?: string | null;
  styleId?: string | null;
  showCta?: boolean;
  frameStyle?: FrameStyle;
}

export default function StyleCollection({
  handle,
  styleId: styleIdProp,
  frameStyle,
}: StyleCollectionProps) {
  const { styleId: derivedStyleId, isLoading: styleLoading } = useProductStyle(
    styleIdProp ? null : (handle ?? null),
  );

  const resolvedStyleId = styleIdProp ?? derivedStyleId;
  const {
    images,
    isLoading: imagesLoading,
    error,
  } = useStyleImages(resolvedStyleId);

  const isLoading = (styleIdProp ? false : styleLoading) || imagesLoading;

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      frameStyle={frameStyle}
    />
  );
}
