"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CarouselProps {
  children: React.ReactNode;
  gap?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoplayMs?: number;
  loop?: boolean;
  /**
   * Slides visibles en desktop (lg+). Cuando se define, el carrusel dimensiona
   * las slides él mismo (el hijo no necesita clases de ancho) para que entren
   * exactamente `perView` sin recorte. Asume `gap-8` (2rem) entre slides.
   */
  perView?: 3 | 4 | 5;
  /**
   * Slides visibles en móvil (base): 1 a ancho completo o 2 a mitad de ancho,
   * en vez del comportamiento por defecto (dejar asomar la siguiente).
   * Requiere `perView`. Tablet/desktop no cambian.
   */
  mobileSlides?: 1 | 2;
  /**
   * Render opcional bajo el track (miniaturas, contador…). Recibe el estado de
   * navegación de Embla que el carrusel ya calcula para los dots.
   */
  renderThumbs?: (nav: {
    selectedIndex: number;
    scrollTo: (index: number) => void;
    count: number;
  }) => React.ReactNode;
}

// Ancho de cada slide de tablet en adelante; en desktop entran exactamente
// `perView`: (100% - gaps) / perView, asumiendo gap-8 (2rem).
// Clases completas y estáticas para que Tailwind las detecte al escanear.
const slideSizingByPerView: Record<
  NonNullable<CarouselProps["perView"]>,
  string
> = {
  3: "sm:[&>*]:flex-[0_0_45%] md:[&>*]:flex-[0_0_33%] lg:[&>*]:flex-[0_0_calc((100%-4rem)/3)]",
  4: "sm:[&>*]:flex-[0_0_45%] md:[&>*]:flex-[0_0_33%] lg:[&>*]:flex-[0_0_calc((100%-6rem)/4)]",
  5: "sm:[&>*]:flex-[0_0_45%] md:[&>*]:flex-[0_0_33%] lg:[&>*]:flex-[0_0_calc((100%-8rem)/5)]",
};

// Ancho base (móvil). Por defecto deja asomar la siguiente slide (72%); con
// `mobileSlides` se ven exactamente 1 o 2 completas (la de 2 descuenta 1rem de
// gap, así que el consumidor debe usar `gap-4` en base).
const mobileSizing = {
  peek: "[&>*]:min-w-0 [&>*]:flex-[0_0_72%]",
  1: "[&>*]:min-w-0 [&>*]:flex-[0_0_100%]",
  2: "[&>*]:min-w-0 [&>*]:flex-[0_0_calc((100%-1rem)/2)]",
};

export function Carousel({
  children,
  gap = "gap-6",
  showArrows = true,
  showDots = false,
  autoplayMs = 0,
  loop = false,
  perView,
  mobileSlides,
  renderThumbs,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop });

  const slideSizing = perView
    ? `${mobileSizing[mobileSlides ?? "peek"]} ${slideSizingByPerView[perView]}`
    : "";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setSnaps(emblaApi.scrollSnapList());
    };
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    update();
  }, [emblaApi]);

  // Autoplay manual: pausa al interactuar con puntero.
  const isPausedRef = useRef(false);
  useEffect(() => {
    if (!emblaApi || autoplayMs <= 0) return;
    const pause = () => {
      isPausedRef.current = true;
    };
    emblaApi.on("pointerDown", pause);
    const id = setInterval(() => {
      if (isPausedRef.current) return;
      emblaApi.scrollNext();
    }, autoplayMs);
    return () => {
      clearInterval(id);
      emblaApi.off("pointerDown", pause);
    };
  }, [emblaApi, autoplayMs]);

  return (
    <div className="relative">
      {showArrows && (
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-dark transition-opacity disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
      )}

      <div className="overflow-hidden py-4" ref={emblaRef}>
        <div className={`flex ${gap} ${slideSizing} align-center`}>
          {children}
        </div>
      </div>

      {showArrows && (
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Siguiente"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-dark transition-opacity disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      )}

      {renderThumbs?.({ selectedIndex, scrollTo, count: snaps.length })}

      {showDots && snaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {snaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-current={i === selectedIndex}
              className={`h-2 rounded-full transition-all ${
                i === selectedIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-slate-dark/30 hover:bg-slate-dark/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
