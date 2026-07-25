import type { CSSProperties, ReactNode } from "react";
import {
  SET_ARTWORK_SHADOW,
  setSunlightStyle,
  setAmbientStyle,
} from "@/entities/product/lib/setLighting";

// Envoltorio que ilumina lo que contenga como si estuviera colgado en la escena
// del set (/set/Set3.png): sombra cálida caída a la derecha más las dos capas de
// luz (sol y penumbra) encima del contenido. Sin eso, la obra se lee como un
// recorte pegado.
//
// Solo aporta sombra y luz: el marco (POSTER_FRAME, CanvasEdgeOverlay), el
// filtro de temperatura (`setArtworkFilter`) y el tamaño/posición son de quien
// lo usa. Los `children` se pintan bajo la luz, así que las capas propias del
// marco van dentro y en su propio orden.

interface SetLightingProps {
  /** Clases del contenedor: dónde va, cuánto mide y su marco, si tiene. */
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function SetLighting({
  className = "",
  style,
  children,
}: SetLightingProps) {
  return (
    <div
      className={`relative ${SET_ARTWORK_SHADOW} ${className}`}
      style={style}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={setSunlightStyle}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={setAmbientStyle}
      />
    </div>
  );
}
