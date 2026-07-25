"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCollectionsWithImage } from "@/lib/shopify/actions/collections";
import { ShopifyCollectionSummary } from "@/lib/shopify/types";

interface CircularCategoryProps {
  /** Handle de colección seleccionado ("" = All). */
  selected: string;
  /** Recibe el handle de colección, o "" al pulsar All. */
  onSelect: (collectionHandle: string) => void;
}

// Cuánto desplaza cada flecha: ~3 avatares.
const SCROLL_STEP = 280;

/**
 * Fila de categorías circulares tipo "stories": un avatar por colección de
 * Shopify con el título debajo, anillo en la seleccionada y scroll horizontal
 * solo cuando los items no caben en el contenedor.
 */
export function CircularCategory({
  selected,
  onSelect,
}: CircularCategoryProps) {
  const [collections, setCollections] = useState<ShopifyCollectionSummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      try {
        const fetched = await getCollectionsWithImage(50);
        if (!cancelled) setCollections(fetched);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCollections();
    return () => {
      cancelled = true;
    };
  }, []);

  // Las flechas solo aparecen cuando el rail desborda y hay hacia dónde ir.
  const railRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setCanScrollLeft(rail.scrollLeft > 1);
    setCanScrollRight(rail.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    syncArrows();
    const observer = new ResizeObserver(syncArrows);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [syncArrows, collections]);

  const scrollBy = (direction: -1 | 1) => {
    railRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex w-20 shrink-0 flex-col items-center gap-2 md:w-24"
          >
            <div className="size-16 animate-pulse rounded-full bg-cream md:size-20" />
            <div className="h-3 w-14 animate-pulse rounded-full bg-cream" />
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) return null;

  const isAllSelected = selected === "";

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll categories left"
          className="absolute left-0 top-8 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-dark shadow-md transition-all hover:shadow-lg md:flex md:top-10"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
      )}

      <ul
        ref={railRef}
        onScroll={syncArrows}
        className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-8"
      >
        {/* "All" limpia el filtro de colección. */}
        <li className="shrink-0 snap-start">
          <button
            type="button"
            onClick={() => onSelect("")}
            aria-pressed={isAllSelected}
            className="flex w-20 flex-col items-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:w-24"
          >
            <span
              className={`flex size-16 shrink-0 items-center justify-center rounded-full bg-white transition-all md:size-20 ${
                isAllSelected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-cream"
                  : "ring-1 ring-[#E0DED9] hover:ring-primary/50"
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-primary">
                apps
              </span>
            </span>
            <span
              className={`line-clamp-2 text-center text-xs leading-tight transition-all ${
                isAllSelected ? "font-bold text-primary" : "text-text-muted"
              }`}
            >
              All
            </span>
          </button>
        </li>

        {collections.map((collection) => {
          const isSelected = selected === collection.handle;

          return (
            <li key={collection.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onSelect(collection.handle)}
                aria-pressed={isSelected}
                className="flex w-20 flex-col items-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:w-24"
              >
                <span
                  className={`block size-16 shrink-0 overflow-hidden rounded-full transition-all md:size-20 ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-cream"
                      : "ring-1 ring-[#E0DED9] hover:ring-primary/50"
                  }`}
                >
                  <Image
                    src={collection.imageUrl}
                    alt={collection.imageAlt ?? collection.title}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                </span>
                <span
                  className={`line-clamp-2 text-center text-xs/5 font-semibold leading-tight transition-all ${
                    isSelected ? "font-bold text-primary" : "text-text-muted"
                  }`}
                >
                  {collection.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll categories right"
          className="absolute right-0 top-8 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-dark shadow-md transition-all hover:shadow-lg md:flex md:top-10"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      )}
    </div>
  );
}
