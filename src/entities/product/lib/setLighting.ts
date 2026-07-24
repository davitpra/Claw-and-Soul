import type { CSSProperties } from "react";

// Luz de escena específica de la foto de set (/set/Set3.png): sol cálido
// entrando por la ventana izquierda, con una banda diagonal brillante sobre la
// pared que se apaga hacia abajo-derecha. El artwork colgado debe recibir esa
// misma luz o se lee como un recorte pegado. Mismo idioma que `frameStyle.ts`:
// gradientes apilados con mix-blend-mode (screen aclara, multiply oscurece).

// Banda de sol continuando la de la pared: aclara desde arriba-izquierda y se
// funde antes del centro del cuadro.
export const setSunlightStyle: CSSProperties = {
  background:
    "linear-gradient(115deg, rgba(255,248,235,0.28), rgba(255,248,235,0) 55%)",
  mixBlendMode: "screen",
};

// Caída a la zona sombreada de la pared: penumbra cálida muy sutil hacia
// abajo-derecha, como el resto de la escena.
export const setAmbientStyle: CSSProperties = {
  background:
    "linear-gradient(115deg, rgba(120,90,60,0) 45%, rgba(120,90,60,0.14))",
  mixBlendMode: "multiply",
};
