"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCollectionsWithImage } from "@/lib/shopify/actions/collections";
import { ShopifyCollectionSummary } from "@/lib/shopify/types";
import { edgeMask, useScrollRail } from "@/hooks/useScrollRail";

interface CircularCategoryProps {
  /** Handle de colección seleccionado ("" = All). */
  selected: string;
  /** Recibe el handle de colección, o "" al pulsar All. */
  onSelect: (collectionHandle: string) => void;
}

/**
 * El rail sale del padding del Container (`px-6 lg:px-10`) para que el avatar
 * siguiente asome por el borde en vez de cortarse contra él, y lo recupera como
 * padding propio para que el primero y el último no queden pegados.
 */
const BLEED = "-mx-6 px-6 lg:-mx-10 lg:px-10";

/**
 * Fila de categorías circulares tipo "stories": un avatar por colección de
 * Shopify con el título debajo, anillo en la seleccionada y arrastre horizontal
 * libre (dedo o mouse) cuando los items no caben.
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

  // El rail se mueve solo con el gesto (dedo o arrastre con mouse); los bordes
  // únicamente deciden de qué lado se dibuja el degradado.
  const {
    railRef,
    canScrollLeft,
    canScrollRight,
    syncEdges,
    dragHandlers,
    dragging,
    wasDragged,
  } = useScrollRail<HTMLUListElement>([collections]);

  // Al soltar tras arrastrar no se selecciona la colección de debajo.
  const handleSelect = (handle: string) => {
    if (wasDragged()) return;
    onSelect(handle);
  };

  if (loading) {
    return (
      <div className={`flex gap-4 overflow-hidden pb-2 ${BLEED}`}>
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
    <ul
      ref={railRef}
      onScroll={syncEdges}
      aria-label="Collections"
      {...dragHandlers}
      style={{
        maskImage: edgeMask(canScrollLeft, canScrollRight),
        WebkitMaskImage: edgeMask(canScrollLeft, canScrollRight),
      }}
      className={`flex select-none gap-4 overflow-x-auto py-8 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${BLEED} ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* "All" limpia el filtro de colección. */}
      <li className="shrink-0">
        <button
          type="button"
          onClick={() => handleSelect("")}
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
          <li key={collection.id} className="shrink-0">
            <button
              type="button"
              onClick={() => handleSelect(collection.handle)}
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
                  draggable={false}
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
  );
}
