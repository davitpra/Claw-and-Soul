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
}

export function Carousel({
  children,
  gap = "gap-6",
  showArrows = true,
  showDots = false,
  autoplayMs = 0,
  loop = false,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop });
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
        <div className={`flex ${gap} align-center`}>{children}</div>
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
