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

// Sombra proyectada del cuadro colgado: cálida y caída a la derecha (el sol
// entra por la izquierda), más una segunda sombra de contacto, corta y cerrada,
// que ancla el cuadro a la pared en vez de dejarlo flotando.
export const SET_ARTWORK_SHADOW =
  "shadow-[10px_12px_26px_-10px_rgba(96,66,38,0.40),2px_3px_6px_-2px_rgba(96,66,38,0.30)]";

// La misma sombra cuando el cuadro se levanta al hover: crece en la dirección
// de la luz (sol por la izquierda) en vez de saltar al teal frío del catálogo.
export const SET_ARTWORK_SHADOW_HOVER =
  "hover:shadow-[14px_18px_40px_-12px_rgba(96,66,38,0.45),3px_4px_9px_-2px_rgba(96,66,38,0.30)]";

// Acerca el artwork a la temperatura de la escena: lo baja un punto de brillo,
// le quita saturación y le añade un velo sepia mínimo.
export const setArtworkFilter: CSSProperties = {
  filter: "brightness(0.98) saturate(0.94) sepia(0.06)",
};
