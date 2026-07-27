"use client";

import type { FrameStyle } from "@/entities/product/lib/frameStyle";
import type { useStyleCollection } from "../model/useStyleCollection";
import CollectionSection from "./CollectionSection";

const DEFAULT_EYEBROW = "This style";
const DEFAULT_TITLE = "See the style in action";
const DEFAULT_DESCRIPTION =
  "Real portraits made in this style. Yours is generated from your own photo — same look, your pet.";

interface StyleShowcaseProps {
  /** Resultado ya resuelto de `useStyleCollection`. */
  collection: ReturnType<typeof useStyleCollection>;
  frameStyle?: FrameStyle;
  /** Por defecto, el nombre del estilo del producto. */
  eyebrow?: string | null;
  title?: string;
  description?: string | null;
  background?: string;
}

/**
 * Sección de estilos con encabezado editorial (eyebrow + título + subtítulo),
 * al modo de `SimilarSouls`. Es el consumo estándar de `CollectionSection` en
 * los product templates, que hasta ahora lo llamaban pelado y dejaban la
 * sección sin título.
 *
 * Recibe la colección ya resuelta en vez de pedirla por su cuenta: dentro de un
 * `SectionFlow` el padre necesita conocer `hasContent` antes de repartir fondos
 * y divisores (por eso tampoco sirve `StyleCollection`).
 */
export default function StyleShowcase({
  collection,
  frameStyle,
  eyebrow,
  title,
  description,
  background,
}: StyleShowcaseProps) {
  return (
    <CollectionSection
      images={collection.images}
      isLoading={collection.isLoading}
      error={collection.error}
      eyebrow={eyebrow ?? collection.styleName ?? DEFAULT_EYEBROW}
      title={title ?? DEFAULT_TITLE}
      description={description ?? DEFAULT_DESCRIPTION}
      frameStyle={frameStyle}
      background={background}
    />
  );
}
