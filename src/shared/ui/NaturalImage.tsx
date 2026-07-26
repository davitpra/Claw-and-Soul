"use client";

import { useCallback, useState } from "react";

// Proporción reservada mientras no sabemos la real: la misma del recorte por
// defecto de <Card>, así que un producto en formato retrato apenas se mueve.
const PLACEHOLDER_RATIO = 2 / 3;

interface NaturalImageProps {
  src: string;
  alt?: string;
  /** Se invoca si la imagen no carga, para poder renderizar un fallback. */
  onError?: () => void;
}

/**
 * Imagen en su proporción natural que no colapsa mientras carga.
 *
 * Un `<img>` con `h-auto` y sin dimensiones intrínsecas mide 0px hasta que el
 * navegador decodifica el archivo: la card no ocupa sitio y de golpe "crece",
 * empujando el resto de la grilla. Aquí se reserva una caja con
 * `aspect-ratio` desde el primer frame y se sustituye por la proporción real
 * en cuanto se conoce, con la transición animada para que el ajuste no se lea
 * como un salto.
 *
 * La medida se toma en dos sitios a propósito: `onLoad` para la carga normal y
 * el callback ref para la imagen ya cacheada, que puede terminar antes de que
 * React enganche el handler y se quedaría con la proporción del placeholder.
 */
export function NaturalImage({ src, alt, onError }: NaturalImageProps) {
  const [ratio, setRatio] = useState<number | null>(null);

  const measure = useCallback((img: HTMLImageElement | null) => {
    if (!img?.naturalWidth || !img.naturalHeight) return;
    setRatio(img.naturalWidth / img.naturalHeight);
  }, []);

  const measureIfComplete = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) measure(img);
    },
    [measure],
  );

  const loaded = ratio !== null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={measureIfComplete}
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      onLoad={(e) => measure(e.currentTarget)}
      onError={onError}
      style={{ aspectRatio: ratio ?? PLACEHOLDER_RATIO }}
      // `object-contain` solo actúa en la ventana en la que la caja aún no tiene
      // la proporción definitiva (placeholder o cambio de `src`): letterbox en
      // vez de una imagen estirada. Con la proporción real es un no-op.
      className={`block h-auto w-full object-contain transition-[aspect-ratio,opacity] duration-300 ease-out motion-reduce:transition-none ${
        loaded ? "opacity-100" : "animate-pulse bg-cream opacity-0"
      }`}
    />
  );
}
