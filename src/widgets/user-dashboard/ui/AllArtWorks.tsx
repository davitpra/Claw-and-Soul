"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import {
  ProductCard,
  posterClasses,
} from "@/entities/pet-product/ui/ProductCard";
import type { Product } from "@/entities/pet-product/model/types";
import { generationStatusBadge } from "@/entities/order/lib/presentation";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import type {
  ApiEnvelope,
  PaginatedResult,
  UserGeneration,
} from "@/entities/order/types";
import {
  SKELETON_ASPECTS,
  SKELETON_ITEM,
  SKELETON_MASONRY,
  staggerDelay,
  useColumnCount,
  useInfiniteSentinel,
  useMasonryColumns,
} from "@/widgets/user-dashboard/lib/masonry";

// Imagen del arte, o `null` mientras la generación no ha producido ninguna
// (pending/processing) o ha fallado. En ese caso NO se renderiza un <img>: ver
// GenerationPlaceholder.
function generationImage(generation: UserGeneration): string | null {
  const url = generation.thumbnailUrl || generation.resultUrl;
  return url ? cloudinaryThumb(url, 600) : null;
}

// Adapta una generación al shape `Product` que consume ProductCard: la imagen del
// arte hace de "poster", el nombre de la mascota de título y el badge superpuesto
// reutiliza el estado de la generación.
function generationToProduct(generation: UserGeneration, img: string): Product {
  return {
    name: generation.pet?.name || "Untitled",
    desc: generation.style?.displayName || "",
    price: "",
    img,
    label:
      generation.style?.displayName ||
      generationStatusBadge(generation.status).label,
  };
}

// Cara visible de una generación todavía sin imagen. Sustituye al <img> roto que
// apuntaba a /placeholder-image.jpg (asset que no existe en public/).
const PLACEHOLDER_BY_STATUS: Record<
  string,
  { icon: string; text: string; spin: boolean }
> = {
  pending: { icon: "hourglass_empty", text: "Queued…", spin: false },
  processing: {
    icon: "progress_activity",
    text: "Creating your artwork…",
    spin: true,
  },
  failed: { icon: "error", text: "Generation failed", spin: false },
};

function GenerationPlaceholder({ generation }: { generation: UserGeneration }) {
  const status = generation.status?.toLowerCase() ?? "";
  const badge = generationStatusBadge(generation.status);
  const state = PLACEHOLDER_BY_STATUS[status] ?? {
    icon: "image",
    text: "No preview yet",
    spin: false,
  };
  const isFailed = status === "failed";

  return (
    <div className="group flex w-full min-w-0 flex-col gap-4">
      <Link
        href={`/user/generations/${generation.id}`}
        className={`relative flex aspect-4/5 flex-col items-center justify-center overflow-hidden rounded-xl px-4 text-center shadow-sm ${
          isFailed ? "bg-red-50" : "bg-cream"
        } ${posterClasses}`}
      >
        <span
          className={`absolute top-3 left-3 rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${badge.classes}`}
        >
          {badge.label}
        </span>
        <span
          className={`material-symbols-outlined text-[32px] ${
            isFailed ? "text-red-500" : "text-primary"
          } ${state.spin ? "animate-spin" : ""}`}
        >
          {state.icon}
        </span>
        <p
          className={`mt-2 text-xs font-bold ${
            isFailed ? "text-red-700" : "text-text-muted"
          }`}
        >
          {state.text}
        </p>
      </Link>

      <div className="flex flex-col items-center gap-3">
        <h3 className="text-center font-display font-black text-slate-dark md:text-lg">
          {generation.pet?.name || "Untitled"}
        </h3>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function AllArtWorks() {
  const { get } = useAuthFetch();

  const [generations, setGenerations] = useState<UserGeneration[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState(false);

  // Generaciones cuya imagen no carga (el asset ya no existe en el CDN). Se degradan
  // al placeholder en vez de dejar el icono de imagen rota del navegador.
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const markBroken = useCallback((id: string) => {
    setBrokenIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // Evita que el observer dispare varias peticiones para la misma página mientras
  // una está en vuelo: el estado de React no se actualiza a tiempo entre callbacks.
  const isFetchingRef = useRef(false);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const isFirst = pageToLoad === 1;
      if (isFirst) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
        setLoadMoreError(false);
      }

      try {
        const res = await get<ApiEnvelope<PaginatedResult<UserGeneration>>>(
          `/generations?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        );
        const fetched = res.data?.data ?? [];
        setGenerations((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setTotalPages(res.data?.meta?.totalPages ?? 1);
        setPage(pageToLoad);
      } catch {
        // Un fallo cargando más no debe borrar las obras ya visibles: solo la
        // primera página cae al estado de error a pantalla completa.
        if (isFirst) setError("Couldn't load your artworks. Please try again.");
        else setLoadMoreError(true);
      } finally {
        isFetchingRef.current = false;
        if (isFirst) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [get],
  );

  useEffect(() => {
    let active = true;
    // Carga inicial. loadPage actualiza estado solo si el componente sigue vivo
    // gracias al guard implícito de React 18; usamos `active` por claridad.
    (async () => {
      if (active) await loadPage(1);
    })();
    return () => {
      active = false;
    };
  }, [loadPage]);

  const hasMore = page < totalPages;

  // Tras un fallo dejamos de observar el centinela y mostramos un botón de
  // reintento, para no reintentar en bucle.
  const shouldObserve = hasMore && !isLoading && !error && !loadMoreError;
  const loadNext = useCallback(() => void loadPage(page + 1), [loadPage, page]);
  const sentinelRef = useInfiniteSentinel(shouldObserve, loadNext);

  const columnCount = useColumnCount();
  const columns = useMasonryColumns(generations, columnCount);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 md:p-8">
        {isLoading && (
          <div className={SKELETON_MASONRY}>
            {SKELETON_ASPECTS.map((aspect, i) => (
              <div key={i} className={SKELETON_ITEM}>
                <div
                  className={`${aspect} animate-pulse rounded-xl bg-cream`}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center rounded-xl bg-red-50 px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="material-symbols-outlined text-[26px]">
                error
              </span>
            </span>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => loadPage(1)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && generations.length === 0 && (
          <div className="px-4 py-8 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
              <span className="material-symbols-outlined text-[32px]">
                palette
              </span>
            </span>
            <h2 className="mt-4 font-display text-xl font-black text-text-main">
              No artworks yet
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              When you create an artwork it will show up here.
            </p>
            <Link
              href="/catalog"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
              Create your first artwork
            </Link>
          </div>
        )}

        {!isLoading && !error && generations.length > 0 && (
          <>
            <div className="flex items-start gap-8">
              {columns.map((col, ci) => (
                <div key={ci} className="flex min-w-0 flex-1 flex-col gap-8">
                  {col.map(({ item: generation, index }) => {
                    const img = brokenIds.has(generation.id)
                      ? null
                      : generationImage(generation);

                    return (
                      <div
                        key={generation.id}
                        className="animate-fade-in-up"
                        style={staggerDelay(index, PAGE_SIZE)}
                      >
                        {img ? (
                          <ProductCard
                            product={generationToProduct(generation, img)}
                            href={`/user/generations/${generation.id}`}
                            showPrice={false}
                            onImageError={() => markBroken(generation.id)}
                          />
                        ) : (
                          <GenerationPlaceholder generation={generation} />
                        )}
                      </div>
                    );
                  })}

                  {/* Placeholder de la tanda en vuelo al fondo de cada columna: se
                      apila abajo sin mover las cards ya visibles. */}
                  {isLoadingMore && (
                    <div
                      className={`${
                        SKELETON_ASPECTS[ci % SKELETON_ASPECTS.length]
                      } animate-pulse rounded-xl bg-cream`}
                    />
                  )}
                </div>
              ))}
            </div>

            {hasMore && !loadMoreError && (
              <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            )}

            {loadMoreError && (
              <div className="mt-6 text-center">
                <p className="text-sm text-text-muted">
                  Couldn&apos;t load more artworks.
                </p>
                <button
                  type="button"
                  onClick={() => loadPage(page + 1)}
                  className="mt-3 rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  Try again
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
