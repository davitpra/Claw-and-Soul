"use client";

import { useProductStyle } from "@/hooks/useProductStyle";
import { useStyleImages } from "@/hooks/useStyleImages";

/**
 * Resuelve las imágenes del estilo de un producto, ya sea por handle o por
 * `styleId` directo.
 *
 * Vive aparte de `StyleCollection` para que el padre pueda saber **antes** de
 * renderizar si la sección va a tener contenido. `CollectionSection` se oculta
 * sola cuando no hay imágenes, y un `SectionFlow` que ya asignó colores no se
 * entera de esa desaparición: la condición tiene que estar arriba.
 */
export function useStyleCollection(
  handle?: string | null,
  styleIdProp?: string | null,
) {
  const {
    styleId: derivedStyleId,
    styleName,
    isLoading: styleLoading,
  } = useProductStyle(styleIdProp ? null : (handle ?? null));

  const resolvedStyleId = styleIdProp ?? derivedStyleId;
  const { images, isLoading: imagesLoading, error } = useStyleImages(
    resolvedStyleId,
  );

  const isLoading = (styleIdProp ? false : styleLoading) || imagesLoading;

  // Durante la carga la sección sigue ocupando lugar (skeleton), así que cuenta
  // como visible; solo desaparece cuando se confirma que no hay nada que mostrar.
  const hasContent = isLoading || (!error && images.length > 0);

  // `styleName` solo se resuelve por handle: con `styleIdProp` no hay a quién
  // preguntarle el nombre, así que el consumidor cae a su propio default.
  return { images, isLoading, error, hasContent, styleName };
}
