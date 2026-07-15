"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export interface DeckGalleryItem {
  /** URL de la imagen de la carta. */
  src: string;
  alt?: string;
  /** Texto bajo el mazo (p. ej. "@ Lisa Martinez"). Se muestra el de la carta activa. */
  caption?: string;
}

interface DeckGalleryProps {
  items: DeckGalleryItem[];
  /** Milisegundos entre pases automáticos; 0 lo desactiva. */
  autoplayMs?: number;
  /** Tamaño/estilos del mazo (por defecto w-64 md:w-80, cuadrado). */
  className?: string;
  /**
   * Click en la carta frontal (un tap sin arrastre). Permite, p. ej., navegar
   * al detalle del item activo.
   */
  onItemClick?: (item: DeckGalleryItem, index: number) => void;
}

// Geometría del abanico: cada carta pivota desde debajo del borde inferior,
// así los bordes superiores se abren como cartas sostenidas en la mano.
const ROTATE_PER_CARD = 7; // grados por posición
const SHIFT_PER_CARD = 3; // % de translateX por posición
const SCALE_PER_CARD = 0.02;
const VISIBLE_RANGE = 3.5; // a partir de aquí la carta se desvanece

// Fracción del ancho que hay que arrastrar para pasar una carta completa.
const DRAG_DISTANCE_RATIO = 0.55;
// Velocidad (px/ms) que cuenta como "flick" aunque el arrastre sea corto.
const FLICK_VELOCITY = 0.4;
// Por debajo de este recorrido (px) el gesto cuenta como click, no como arrastre.
const CLICK_MAX_MOVEMENT = 8;

/** Distancia circular con signo de la carta i a la posición virtual (rango -n/2..n/2). */
function wrapOffset(delta: number, n: number): number {
  let d = ((delta % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

function mod(i: number, n: number): number {
  return ((i % n) + n) % n;
}

/**
 * Galería tipo "mazo de cartas": las imágenes se apilan en abanico y al
 * arrastrar horizontalmente la carta frontal se pasa a la siguiente, con la
 * sensación de barajar. Autoplay en loop, pausado al hacer hover o arrastrar.
 */
export function DeckGallery({
  items,
  autoplayMs = 3500,
  className = "w-64 md:w-80",
  onItemClick,
}: DeckGalleryProps) {
  const n = items.length;

  // `index` crece sin límite (se normaliza con mod) para que el loop nunca "rebobine".
  const [index, setIndex] = useState(0);
  // Avance fraccional durante el arrastre: +1 = una carta hacia adelante.
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const deckRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, lastX: 0, lastT: 0, velocity: 0, moved: 0 });

  useEffect(() => {
    if (!autoplayMs || n < 2 || dragging || hovered) return;
    const id = setInterval(() => setIndex((i) => i + 1), autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, n, dragging, hovered]);

  if (n === 0) return null;

  const virtual = index + progress;
  const active = items[mod(Math.round(virtual), n)];

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (n < 2 && !onItemClick) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      moved: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const width = deckRef.current?.offsetWidth ?? 300;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));

    if (n < 2) return;
    // Arrastrar a la izquierda (dx<0) empuja la carta frontal y trae la siguiente.
    const raw = -dx / (width * DRAG_DISTANCE_RATIO);
    // Solo se pasa de una en una: se frena con resistencia más allá de ±1.
    const clamped = Math.max(-1, Math.min(1, raw)) + (raw - Math.max(-1, Math.min(1, raw))) * 0.15;
    setProgress(clamped);

    const dt = e.timeStamp - drag.current.lastT;
    if (dt > 0) {
      drag.current.velocity = (e.clientX - drag.current.lastX) / dt;
      drag.current.lastX = e.clientX;
      drag.current.lastT = e.timeStamp;
    }
  };

  const endDrag = () => {
    if (!dragging) return;
    const { velocity, moved } = drag.current;
    setProgress(0);
    setDragging(false);

    // Un gesto casi sin recorrido es un click sobre la carta activa, no un arrastre.
    if (moved < CLICK_MAX_MOVEMENT) {
      if (onItemClick) {
        const activeIndex = mod(Math.round(index + progress), n);
        onItemClick(items[activeIndex], activeIndex);
      }
      return;
    }

    let step = Math.round(progress);
    // Un flick rápido pasa la carta aunque el recorrido haya sido corto.
    if (step === 0 && Math.abs(velocity) > FLICK_VELOCITY) {
      step = velocity < 0 ? 1 : -1;
    }
    setIndex((i) => i + step);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setIndex((i) => i + 1);
    if (e.key === "ArrowLeft") setIndex((i) => i - 1);
    if ((e.key === "Enter" || e.key === " ") && onItemClick) {
      e.preventDefault();
      const activeIndex = mod(Math.round(virtual), n);
      onItemClick(items[activeIndex], activeIndex);
    }
  };

  const cardStyle = (i: number): CSSProperties => {
    const p = wrapOffset(i - virtual, n);
    const abs = Math.abs(p);
    return {
      transform: `translateX(${p * SHIFT_PER_CARD}%) rotate(${p * ROTATE_PER_CARD}deg) scale(${
        1 - Math.min(abs, 4) * SCALE_PER_CARD
      })`,
      transformOrigin: "50% 115%",
      zIndex: 100 - Math.round(abs * 10),
      opacity: abs > VISIBLE_RANGE ? 0 : 1,
      transition: dragging
        ? "none"
        : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease",
    };
  };

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={deckRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image deck gallery"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={`relative aspect-square select-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-8 rounded-[2.5rem] ${
          n > 1
            ? dragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : onItemClick
              ? "cursor-pointer"
              : ""
        } ${className}`}
        style={{ touchAction: "pan-y" }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.src}-${i}`}
            className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
            style={cardStyle(i)}
            aria-hidden={mod(Math.round(virtual), n) !== i}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt ?? ""}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {active?.caption && (
        <p
          key={active.caption}
          className="mt-10 font-mono text-sm tracking-wider animate-fade-in-up"
        >
          {active.caption}
        </p>
      )}
    </div>
  );
}
