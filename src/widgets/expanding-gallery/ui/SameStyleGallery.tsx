"use client";

import {
  sameStyleGalleryTitle,
  useSameStyleItems,
} from "../model/useSameStyleItems";
import ExpandingGallery from "./ExpandingGallery";

interface SameStyleGalleryProps {
  /** Handle de Shopify del producto actual; se excluye de los resultados. */
  handle?: string | null;
  /** Formato de entrega del producto actual; acota los hermanos junto a `artKind`. */
  template?: string | null;
  /** Tipo de obra del producto actual; sin él (ni template) no se filtra por ese eje. */
  artKind?: string | null;
  eyebrow?: string;
  title?: string;
  description?: string;
  background?: string;
}

/**
 * Muestra en el acordeón `ExpandingGallery` los productos que comparten
 * estilo y tipo de obra con el producto actual. Es un wrapper delgado:
 * resuelve los items con `useSameStyleItems` y delega el render en el
 * componente presentacional.
 *
 * Dentro de un `SectionFlow` conviene usar `useSameStyleItems` +
 * `ExpandingGallery` directamente, para que el padre sepa si hay contenido
 * antes de repartir fondos.
 */
export default function SameStyleGallery({
  handle,
  template,
  artKind,
  eyebrow,
  title,
  description,
  background,
}: SameStyleGalleryProps) {
  const {
    items,
    styleName,
    artKind: galleryArtKind,
  } = useSameStyleItems(handle, { template, artKind });

  if (items.length === 0) return null;

  return (
    <ExpandingGallery
      eyebrow={eyebrow ?? styleName ?? "Same style"}
      title={title ?? sameStyleGalleryTitle(galleryArtKind)}
      description={description}
      items={items}
      background={background}
    />
  );
}
