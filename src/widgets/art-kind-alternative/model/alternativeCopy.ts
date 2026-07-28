import type { ArtKind } from "@/entities/product/model/artKind";

/** Un perk de la fila de iconos: símbolo de Material Symbols + su label. */
interface AlternativePerk {
  icon: string;
  label: string;
}

interface AlternativeCopy {
  title: string;
  body: string;
  perks: AlternativePerk[];
  /** Texto del botón; el precio de la opción elegida se antepone. */
  cta: string;
  /** Foto de set sobre la que se cuelga la obra. */
  setImage: string;
  setImageAlt: string;
  /** Dimensiones naturales de `setImage`, para el `next/image`. */
  setImageSize: { width: number; height: number };
  /** Posición y ancho de la obra dentro del set (pared libre de esa foto). */
  artworkClassName: string;
}

// Copy y escena de la sección según el tipo de obra que se ofrece (el contrario
// al del producto actual). Vive acá y no en el componente para que las dos
// direcciones se lean de un vistazo, como el resto de los mapas por eje del
// repo (ART_KIND_LABELS, TEMPLATE_LABELS, FRAME_SHADOWS…).
export const ALTERNATIVE_COPY: Record<ArtKind, AlternativeCopy> = {
  // Desde un coloreable: para quien quiere la obra pero no pintarla.
  print: {
    title: "Love the art, not the brushes?",
    body: "Not everyone wants to pick up a paintbrush — and that's okay. Get the exact same artwork as a ready-to-hang print, produced in ultra-high definition so every stroke and detail of the style stays crisp on your wall.",
    perks: [
      { icon: "print", label: "Museum-quality print" },
      { icon: "high_quality", label: "Ultra-high definition" },
      { icon: "palette", label: "Same Art" },
    ],
    cta: "Get it printed",
    setImage: "/set/Set3.png",
    setImageAlt:
      "Framed ultra-high-definition pet portrait print in a cozy living room",
    setImageSize: { width: 1082, height: 1454 },
    // El suelo del set arranca al ~78% de la altura; la obra va sobre la pared
    // vacía de la izquierda. El marco no se decide acá: lo pone el componente a
    // partir del formato elegido en las pills (`toFrameStyle`).
    artworkClassName: "left-[29%] top-[13%] w-[40%]",
  },
  // Desde el arte terminado: para quien prefiere pintar la obra a mano.
  pbn: {
    title: "Rather bring it to life yourself?",
    body: "The same artwork, turned into a paint-by-numbers kit. Every area is numbered and matched to a color, so you can paint your pet stroke by stroke — no experience needed — and hang a piece you made yourself.",
    perks: [
      { icon: "brush", label: "Numbered by hand" },
      { icon: "format_paint", label: "Matched colors" },
      { icon: "palette", label: "Same Art" },
    ],
    cta: "Get the paint kit",
    setImage: "/set/Set2.png",
    setImageAlt:
      "Hand-painted pet portrait hanging above a wooden console in a sunlit living room",
    setImageSize: { width: 1083, height: 1453 },
    // Pared libre sobre la consola, entre la ventana y el borde derecho.
    artworkClassName: "left-[20%] top-[12%] w-[36%]",
  },
};
