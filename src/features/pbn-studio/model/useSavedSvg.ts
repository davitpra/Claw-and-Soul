import { useCallback, useRef, useState } from "react";

/**
 * Inyecta un SVG ya persistido en un contenedor del DOM para que `useExport`
 * pueda exportarlo: todas sus descargas parten de un `<svg>` vivo, no de un
 * string.
 *
 * Es `useProcessing.loadSaved` sin el pipeline detrás — aquí no hay
 * `ProcessResult`, paleta ni progreso que reconstruir, sólo el lienzo. La carga
 * es perezosa (`load()`) porque quien lo usa —la ficha de un PBN guardado— sólo
 * necesita el SVG si el usuario abre el diálogo de descarga.
 */
export function useSavedSvg(svgUrl: string | null) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const container = svgContainerRef.current;
    if (!svgUrl || !container || ready || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(svgUrl);
      if (!res.ok) throw new Error(String(res.status));
      container.innerHTML = await res.text();
      setReady(true);
    } catch {
      // Normalmente CORS. No hay pipeline al que caer, así que la UI ofrece
      // reintentar.
      setError("We couldn't load this template. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [svgUrl, ready, loading]);

  return { svgContainerRef, ready, loading, error, load };
}
