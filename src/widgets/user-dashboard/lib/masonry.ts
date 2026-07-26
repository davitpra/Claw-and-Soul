"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Mecánica compartida por las galerías del dashboard (AllArtWorks, AllPbn):
// masonry con scroll infinito. Vivía dentro de AllArtWorks; se extrajo aquí para
// que ambas galerías se comporten igual sin duplicar la lógica.

// Masonry con columnas fijas repartidas por índice (round-robin), NO con CSS columns.
// Motivo: `column-fill: balance` rebalancea todas las columnas cada vez que se añaden
// items, así que en scroll infinito las cards ya visibles saltan de columna al cargar
// la siguiente tanda. Con columnas fijas cada obra tiene su columna asignada por su
// índice, y una tanda nueva solo se apila al fondo sin mover las anteriores.
// El skeleton inicial (estático, sin append) sí puede usar CSS columns sin problema.
export const SKELETON_MASONRY =
  "columns-2 gap-8 [column-fill:_balance] lg:columns-3 xl:columns-4";
export const SKELETON_ITEM = "mb-8 break-inside-avoid";

// Alturas variadas para que el estado de carga anticipe la forma de la galería.
export const SKELETON_ASPECTS = [
  "aspect-3/4",
  "aspect-square",
  "aspect-4/5",
  "aspect-2/3",
  "aspect-square",
  "aspect-3/4",
  "aspect-4/5",
  "aspect-2/3",
];

// Número de columnas por breakpoint (Tailwind: lg=1024px, xl=1280px). El reparto en
// columnas se hace en JS, así que necesitamos saber cuántas hay en cada momento.
const COLUMN_BREAKPOINTS = [
  { query: "(min-width: 1280px)", count: 4 },
  { query: "(min-width: 1024px)", count: 3 },
];
const BASE_COLUMNS = 2;

export function useColumnCount() {
  const [count, setCount] = useState(BASE_COLUMNS);
  useEffect(() => {
    const lists = COLUMN_BREAKPOINTS.map((b) => window.matchMedia(b.query));
    const update = () => {
      const hit = COLUMN_BREAKPOINTS.find((_, i) => lists[i].matches);
      setCount(hit ? hit.count : BASE_COLUMNS);
    };
    update();
    lists.forEach((l) => l.addEventListener("change", update));
    return () => lists.forEach((l) => l.removeEventListener("change", update));
  }, []);
  return count;
}

// Reparto en columnas fijas: el item `i` va siempre a la columna `i % columnCount`.
// Conservamos el índice global para el stagger de entrada y para variar el skeleton.
export function useMasonryColumns<T>(items: T[], columnCount: number) {
  return useMemo(() => {
    const cols: { item: T; index: number }[][] = Array.from(
      { length: columnCount },
      () => [],
    );
    items.forEach((item, index) => cols[index % columnCount].push({ item, index }));
    return cols;
  }, [items, columnCount]);
}

// Cada tanda entra escalonada en vez de aparecer de golpe. El retraso se calcula
// por posición dentro de su página, así que la tanda nueva se despliega sola y las
// cards ya montadas no vuelven a animarse (React conserva sus nodos por `key`).
const STAGGER_MS = 60;

export function staggerDelay(index: number, pageSize: number) {
  return { animationDelay: `${(index % pageSize) * STAGGER_MS}ms` };
}

// Scroll infinito: un centinela invisible bajo la galería pide la página siguiente
// cuando se acerca al viewport. Con `enabled` en false (cargando, error, o no hay
// más páginas) dejamos de observar, para no reintentar en bucle tras un fallo.
//
// `onIntersect` debe venir de un `useCallback` que dependa de la página actual: al
// cambiar su identidad el observer se recrea y vuelve a evaluar el centinela, que
// es lo que encadena la siguiente tanda cuando el fondo sigue a la vista tras cargar.
export function useInfiniteSentinel(enabled: boolean, onIntersect: () => void) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      // Se adelanta media pantalla para que la siguiente tanda llegue antes de
      // que el usuario toque el fondo.
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return sentinelRef;
}
