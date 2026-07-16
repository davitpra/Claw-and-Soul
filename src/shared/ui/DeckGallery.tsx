"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
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

// Excursión de la carta en tránsito (posición -1..0): en vez de deslizarse
// directa a su hueco del abanico, sale en arco hacia el lado —se aleja, gira y
// se encoge— y vuelve a entrar por detrás del mazo. Amplitudes en el pico.
const SWING_X = 70; // % de translateX extra
const SWING_ROTATE = 10; // grados extra
const SWING_SCALE = 0.16; // encogimiento extra

// Duración del asentamiento tras soltar (o en autoplay).
const SETTLE_MS = 900;

// Fracción del ancho que hay que arrastrar para pasar una carta completa.
const DRAG_DISTANCE_RATIO = 0.9;
// Velocidad (px/ms) que cuenta como "flick" aunque el arrastre sea corto.
const FLICK_VELOCITY = 0.6;
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

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Galería tipo "mazo de cartas": las imágenes se apilan en abanico y al
 * arrastrar horizontalmente la carta frontal sale en arco y pasa detrás del
 * mazo, como al barajar. Autoplay en loop, pausado al hacer hover o arrastrar.
 *
 * Toda la animación se conduce por rAF sobre una posición virtual continua
 * (no con transiciones CSS): así la carta en tránsito puede seguir una curva
 * intermedia (la excursión) en lugar de interpolar directo entre dos estados.
 */
export function DeckGallery({
  items,
  autoplayMs = 3500,
  className = "w-64 md:w-80",
  onItemClick,
}: DeckGalleryProps) {
  const n = items.length;

  // Posición continua del mazo: la carta i está "al frente" cuando virtual ≈ i
  // (mod n). Crece sin límite para que el loop nunca "rebobine".
  const [virtual, setVirtual] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const deckRef = useRef<HTMLDivElement>(null);
  const virtualRef = useRef(0); // espejo de `virtual` para los handlers
  const targetRef = useRef(0); // entero al que el mazo tiende a asentarse
  const rafRef = useRef(0);
  const drag = useRef({
    startX: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: 0,
    baseProgress: 0,
  });

  const setV = useCallback((v: number) => {
    virtualRef.current = v;
    setVirtual(v);
  }, []);

  /** Asienta el mazo en `target` con un tween rAF (ease-out, estilo settle). */
  const animateTo = useCallback(
    (target: number) => {
      cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      const from = virtualRef.current;
      const delta = target - from;
      if (delta === 0) return;
      if (prefersReducedMotion()) {
        setV(target);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / SETTLE_MS);
        const eased = 1 - Math.pow(1 - t, 4);
        setV(from + delta * eased);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [setV],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (!autoplayMs || n < 2 || dragging || hovered) return;
    const id = setInterval(
      () => animateTo(targetRef.current + 1),
      autoplayMs,
    );
    return () => clearInterval(id);
  }, [autoplayMs, n, dragging, hovered, animateTo]);

  if (n === 0) return null;

  const active = items[mod(Math.round(virtual), n)];

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (n < 2 && !onItemClick) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Si se agarra en pleno vuelo, el arrastre continúa desde donde va el mazo.
    cancelAnimationFrame(rafRef.current);
    drag.current = {
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      moved: 0,
      baseProgress: virtualRef.current - targetRef.current,
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
    const raw = -dx / (width * DRAG_DISTANCE_RATIO) + drag.current.baseProgress;
    // Solo se pasa de una en una: se frena con resistencia más allá de ±1.
    const clamped = Math.max(-1, Math.min(1, raw)) + (raw - Math.max(-1, Math.min(1, raw))) * 0.15;
    setV(targetRef.current + clamped);

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
    setDragging(false);

    // Un gesto casi sin recorrido es un click sobre la carta activa, no un arrastre.
    if (moved < CLICK_MAX_MOVEMENT) {
      if (onItemClick) {
        const activeIndex = mod(Math.round(virtualRef.current), n);
        onItemClick(items[activeIndex], activeIndex);
      }
      animateTo(targetRef.current);
      return;
    }

    let step = Math.round(virtualRef.current - targetRef.current);
    // Un flick rápido pasa la carta aunque el recorrido haya sido corto.
    if (step === 0 && Math.abs(velocity) > FLICK_VELOCITY) {
      step = velocity < 0 ? 1 : -1;
    }
    animateTo(targetRef.current + step);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") animateTo(targetRef.current + 1);
    if (e.key === "ArrowLeft") animateTo(targetRef.current - 1);
    if ((e.key === "Enter" || e.key === " ") && onItemClick) {
      e.preventDefault();
      const activeIndex = mod(Math.round(virtual), n);
      onItemClick(items[activeIndex], activeIndex);
    }
  };

  const cardStyle = (i: number): CSSProperties => {
    const p = wrapOffset(i - virtual, n);
    const abs = Math.abs(p);

    // Posición base en el abanico.
    let x = p * SHIFT_PER_CARD;
    let rotate = p * ROTATE_PER_CARD;
    let scale = 1 - Math.min(abs, 4) * SCALE_PER_CARD;
    let z = 100 - Math.round(abs * 10);

    // Carta en tránsito entre el frente (0) y el fondo izquierdo (-1): arco
    // hacia afuera con pico a mitad de camino. Hasta el pico va por encima del
    // mazo; pasado el punto máximo se mete detrás de la carta que entra (el
    // cruce ocurre en la distancia máxima, donde apenas se solapan).
    if (p > -1 && p < 0) {
      const t = -p;
      const k = Math.sin(Math.PI * t);
      x -= k * SWING_X;
      rotate -= k * SWING_ROTATE;
      scale -= k * SWING_SCALE;
      if (t < 0.5) z += 80;
    }

    return {
      transform: `translateX(${x}%) rotate(${rotate}deg) scale(${scale})`,
      transformOrigin: "50% 115%",
      zIndex: z,
      opacity: abs > VISIBLE_RANGE ? 0 : 1,
      transition: "opacity 300ms ease",
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
