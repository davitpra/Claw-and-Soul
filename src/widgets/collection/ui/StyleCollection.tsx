"use client";

import type { FrameStyle } from "@/entities/product/lib/frameStyle";
import { useStyleCollection } from "../model/useStyleCollection";
import CollectionSection from "./CollectionSection";

interface StyleCollectionProps {
  handle?: string | null;
  styleId?: string | null;
  showCta?: boolean;
  frameStyle?: FrameStyle;
  background?: string;
}

/**
 * Wrapper que resuelve los datos por su cuenta. Dentro de un `SectionFlow` el
 * padre necesita saber de antemano si hay contenido, así que ahí conviene usar
 * `useStyleCollection` + `CollectionSection` directamente.
 */
export default function StyleCollection({
  handle,
  styleId,
  frameStyle,
  background,
}: StyleCollectionProps) {
  const { images, isLoading, error } = useStyleCollection(handle, styleId);

  return (
    <CollectionSection
      images={images}
      isLoading={isLoading}
      error={error}
      frameStyle={frameStyle}
      background={background}
    />
  );
}
