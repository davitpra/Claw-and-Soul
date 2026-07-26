"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  /** Fracción del nodo que debe verse para disparar (0–1). */
  threshold?: number;
  /** Margen del root; un valor negativo abajo retrasa el disparo. */
  rootMargin?: string;
};

/**
 * Marca `true` la primera vez que el nodo entra en viewport y deja de observar:
 * las animaciones de entrada se disparan una sola vez, no cada vez que el
 * usuario pasa por la sección.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = "0px 0px -12% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  return { ref, inView };
}
