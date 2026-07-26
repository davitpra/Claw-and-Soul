"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import {
  ProductCard,
  posterClasses,
} from "@/entities/pet-product/ui/ProductCard";
import type { Product } from "@/entities/pet-product/model/types";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import type {
  ApiEnvelope,
  PaginatedResult,
  UserPbnListItem,
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

// La card muestra la foto original de la mascota, no el lienzo con números: es la
// que hace reconocible la obra de un vistazo. `sourceImageUrl` es nulo en PBNs
// antiguos (y en los guardados sin source), así que cae al preview coloreado.
function pbnImage(pbn: UserPbnListItem): string | null {
  const url = pbn.sourceImageUrl ?? pbn.previewUrl;
  return url ? cloudinaryThumb(url, 600) : null;
}

function styleName(pbn: UserPbnListItem): string {
  return pbn.generation?.style?.displayName || "";
}

// El `petId` propio del PBN no se rellena al guardar, así que la mascota casi
// siempre llega por la generación de origen. Sin ninguna de las dos (PBN subido a
// mano) el título cae al estilo, y sólo entonces al literal genérico.
function pbnTitle(pbn: UserPbnListItem): string {
  return (
    pbn.pet?.name ||
    pbn.generation?.pet?.name ||
    styleName(pbn) ||
    "Paint by Numbers"
  );
}

// Adapta un PBN al shape `Product` que consume ProductCard: la foto hace de
// "poster", el nombre de la mascota de título y el badge superpuesto dice cuántos
// colores tiene el kit. Ojo: no marcamos `isPaintByNumbers`, porque ese flag hace
// que ProductCard sustituya el label por un badge de dificultad del estilo.
function pbnToProduct(pbn: UserPbnListItem, img: string): Product {
  return {
    name: pbnTitle(pbn),
    desc: styleName(pbn),
    price: "",
    img,
    label: pbn.colorCount ? `${pbn.colorCount} colors` : styleName(pbn),
  };
}

// Cara visible de un PBN sin ninguna imagen utilizable. Espeja
// GenerationPlaceholder de AllArtWorks.
function PbnPlaceholder({ pbn }: { pbn: UserPbnListItem }) {
  return (
    <div className="group flex w-full min-w-0 flex-col gap-4">
      <Link
        href={`/user/pbn/${pbn.id}`}
        className={`relative flex aspect-4/5 flex-col items-center justify-center overflow-hidden rounded-xl bg-cream px-4 text-center shadow-sm ${posterClasses}`}
      >
        <span className="material-symbols-outlined text-[32px] text-primary">
          format_paint
        </span>
        <p className="mt-2 text-xs font-bold text-text-muted">No preview yet</p>
      </Link>

      <div className="flex flex-col items-center gap-3">
        <h3 className="text-center font-display font-black text-slate-dark md:text-lg">
          {pbnTitle(pbn)}
        </h3>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function AllPbn() {
  const { get } = useAuthFetch();

  const [items, setItems] = useState<UserPbnListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState(false);

  // PBNs cuya imagen no carga (el asset ya no existe en el CDN). Se degradan al
  // placeholder en vez de dejar el icono de imagen rota del navegador.
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
        const res = await get<ApiEnvelope<PaginatedResult<UserPbnListItem>>>(
          `/paint-by-numbers?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        );
        const fetched = res.data?.data ?? [];
        setItems((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setTotalPages(res.data?.meta?.totalPages ?? 1);
        setPage(pageToLoad);
      } catch {
        // Un fallo cargando más no debe borrar lo ya visible: solo la primera
        // página cae al estado de error a pantalla completa.
        if (isFirst)
          setError("Couldn't load your Paint by Numbers. Please try again.");
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
    (async () => {
      if (active) await loadPage(1);
    })();
    return () => {
      active = false;
    };
  }, [loadPage]);

  const hasMore = page < totalPages;

  const shouldObserve = hasMore && !isLoading && !error && !loadMoreError;
  const loadNext = useCallback(() => void loadPage(page + 1), [loadPage, page]);
  const sentinelRef = useInfiniteSentinel(shouldObserve, loadNext);

  const columnCount = useColumnCount();
  const columns = useMasonryColumns(items, columnCount);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-text-main">
            My Paint by Numbers
          </h2>
          <Link
            href="/studio"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
          >
            Create new
          </Link>
        </div>

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

        {!isLoading && !error && items.length === 0 && (
          <div className="px-4 py-8 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
              <span className="material-symbols-outlined text-[32px]">
                format_paint
              </span>
            </span>
            <h2 className="mt-4 font-display text-xl font-black text-text-main">
              No Paint by Numbers yet
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              You haven&apos;t saved any Paint by Numbers yet.
            </p>
            <Link
              href="/studio"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                brush
              </span>
              Create your first Paint by Numbers
            </Link>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="flex items-start gap-8">
              {columns.map((col, ci) => (
                <div key={ci} className="flex min-w-0 flex-1 flex-col gap-8">
                  {col.map(({ item: pbn, index }) => {
                    const img = brokenIds.has(pbn.id) ? null : pbnImage(pbn);

                    return (
                      <div
                        key={pbn.id}
                        className="animate-fade-in-up"
                        style={staggerDelay(index, PAGE_SIZE)}
                      >
                        {img ? (
                          <ProductCard
                            product={pbnToProduct(pbn, img)}
                            href={`/user/pbn/${pbn.id}`}
                            showPrice={false}
                            onImageError={() => markBroken(pbn.id)}
                          />
                        ) : (
                          <PbnPlaceholder pbn={pbn} />
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
                  Couldn&apos;t load more Paint by Numbers.
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
