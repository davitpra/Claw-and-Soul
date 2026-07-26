"use client";

import { useSameStyleItems } from "../model/useSameStyleItems";
import ExpandingGallery from "./ExpandingGallery";

interface SameStyleGalleryProps {
  /** Handle de Shopify del producto actual; se excluye de los resultados. */
  handle?: string | null;
  eyebrow?: string;
  title?: string;
  description?: string;
  background?: string;
}

/**
 * Muestra en el acordeón `ExpandingGallery` los productos que comparten
 * estilo con el producto actual. Es un wrapper delgado: resuelve los items con
 * `useSameStyleItems` y delega el render en el componente presentacional.
 *
 * Dentro de un `SectionFlow` conviene usar `useSameStyleItems` +
 * `ExpandingGallery` directamente, para que el padre sepa si hay contenido
 * antes de repartir fondos.
 */
export default function SameStyleGallery({
  handle,
  eyebrow,
  title = "More in this style",
  description,
  background,
}: SameStyleGalleryProps) {
  const { items, styleName } = useSameStyleItems(handle);

  if (items.length === 0) return null;

  return (
    <ExpandingGallery
      eyebrow={eyebrow ?? styleName ?? "Same style"}
      title={title}
      description={description}
      items={items}
      background={background}
    />
  );
}
