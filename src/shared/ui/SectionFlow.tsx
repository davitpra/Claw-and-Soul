import { Fragment, type CSSProperties, type ReactNode } from "react";
import WaveTransition from "./WaveTransition";

export type SectionBg = "white" | "cream";

const BG_CLASS: Record<SectionBg, string> = {
  white: "bg-white",
  cream: "bg-cream",
};

/**
 * Valor CSS crudo del mismo color, para el `fill` del SVG del divisor y para
 * las vars de superficie. Ojo: `--color-white` no está declarado en el
 * `@theme` de `globals.css`, así que el blanco va literal.
 */
const BG_COLOR: Record<SectionBg, string> = {
  white: "#fff",
  cream: "var(--color-cream)",
};

const OPPOSITE: Record<SectionBg, SectionBg> = {
  white: "cream",
  cream: "white",
};

export interface SectionSpec {
  /** Clave de React; también sirve para identificar la sección al depurar. */
  id: string;
  node: ReactNode;
  /** Si es `false` la sección no se renderiza ni consume turno en la alternancia. */
  when?: boolean;
  /** Fija el color en vez de alternar. La alternancia sigue desde este valor. */
  pin?: SectionBg;
}

interface SectionFlowProps {
  sections: SectionSpec[];
  /** Color de la primera sección visible. */
  start?: SectionBg;
}

/**
 * Apila secciones alternando el fondo entre white y cream, e inserta el
 * divisor ondulado en cada cambio de color.
 *
 * El orden de `sections` es la única fuente de verdad: los colores se asignan
 * **después** de filtrar las condicionales, así que agregar, quitar o reordenar
 * una sección no puede dejar un divisor huérfano ni desincronizado. Las
 * secciones no saben de qué color les tocó ir — la misma sección puede quedar
 * blanca en un template y cream en otro sin tocar su código.
 *
 * Cada sección recibe además dos CSS vars: `--section-bg` con su propio color y
 * `--section-contrast` con el opuesto, para los elementos internos que deben
 * contrastar (chips, items de acordeón) sin hardcodear un color que se rompería
 * al invertirse el fondo.
 *
 * Las secciones que deciden ocultarse solas (`return null` con datos de un hook
 * propio) deben elevar esa condición al `when` de su spec; si no, el flujo
 * asigna colores contando con ellas y la alternancia queda corrida.
 */
export default function SectionFlow({
  sections,
  start = "white",
}: SectionFlowProps) {
  const resolved: { section: SectionSpec; bg: SectionBg }[] = [];
  for (const section of sections) {
    if (section.when === false) continue;
    const previous = resolved[resolved.length - 1]?.bg;
    const bg =
      section.pin ?? (previous === undefined ? start : OPPOSITE[previous]);
    resolved.push({ section, bg });
  }

  return (
    <>
      {resolved.map(({ section, bg }, i) => {
        const prev = i > 0 ? resolved[i - 1].bg : null;
        return (
          <Fragment key={section.id}>
            {prev !== null && prev !== bg && (
              // Alterna la orientación como venía haciéndose a mano: se entra a
              // la isla de color sin flip y se sale con flip.
              <WaveTransition
                from={BG_COLOR[prev]}
                to={BG_COLOR[bg]}
                flip={i % 2 === 0}
              />
            )}
            <div
              className={BG_CLASS[bg]}
              style={
                {
                  "--section-bg": BG_COLOR[bg],
                  "--section-contrast": BG_COLOR[OPPOSITE[bg]],
                } as CSSProperties
              }
            >
              {section.node}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
