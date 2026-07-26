"use client";

import {
  DependencyList,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/** Un gesto por debajo de este recorrido es un click, no un arrastre. */
const CLICK_MAX_MOVEMENT = 5;

/** Degradado de borde que insinúa el contenido que queda fuera de vista. */
export function edgeMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined;
  return `linear-gradient(to right, ${
    left ? "transparent, black 6%" : "black, black 0%"
  }, ${right ? "black 94%, transparent" : "black 100%, black"})`;
}

interface ScrollRailDragHandlers<T extends HTMLElement> {
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
}

/**
 * Convierte un contenedor con `overflow-x-auto` en un carrusel manejable:
 * expone si queda contenido a cada lado (para degradados de borde u otras
 * pistas visuales) y añade arrastre con mouse.
 *
 * El arrastre solo se activa con puntero de tipo mouse; en táctil se deja el
 * scroll nativo del navegador, que ya gestiona la inercia y el pan vertical de
 * la página.
 *
 * `deps` fuerza el recálculo cuando cambia el contenido del rail (p. ej. al
 * llegar los datos), ya que el ResizeObserver observa el contenedor y su tamaño
 * no varía al añadirse items.
 */
export function useScrollRail<T extends HTMLElement>(
  deps: DependencyList = [],
) {
  const railRef = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setCanScrollLeft(rail.scrollLeft > 1);
    setCanScrollRight(rail.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(rail);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEdges, ...deps]);

  const drag = useRef({ startX: 0, startScrollLeft: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((event: ReactPointerEvent<T>) => {
    const rail = railRef.current;
    // El recorrido se limpia también en táctil: si no, un tap posterior a un
    // arrastre con mouse heredaría el `moved` viejo y se descartaría.
    drag.current = {
      startX: event.clientX,
      startScrollLeft: rail?.scrollLeft ?? 0,
      moved: 0,
    };
    if (!rail || event.pointerType !== "mouse" || event.button !== 0) return;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const rail = railRef.current;
      if (!rail || !dragging) return;
      const dx = event.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      // La captura se toma al superar el umbral: antes de eso el gesto todavía
      // puede resolverse como un click sobre un item.
      if (drag.current.moved > CLICK_MAX_MOVEMENT) {
        rail.setPointerCapture(event.pointerId);
      }
      rail.scrollLeft = drag.current.startScrollLeft - dx;
    },
    [dragging],
  );

  const endDrag = useCallback((event: ReactPointerEvent<T>) => {
    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }, []);

  const dragHandlers: ScrollRailDragHandlers<T> = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  /**
   * True si el gesto que acaba de terminar fue un arrastre. Los items del rail
   * lo consultan en su `onClick` para no activarse al soltar tras arrastrar.
   */
  const wasDragged = useCallback(
    () => drag.current.moved > CLICK_MAX_MOVEMENT,
    [],
  );

  return {
    railRef,
    canScrollLeft,
    canScrollRight,
    syncEdges,
    dragHandlers,
    dragging,
    wasDragged,
  };
}
