"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import type { Product } from "@/entities/pet-product/model/types";
import { generationStatusBadge } from "@/entities/order/lib/presentation";
import type {
  ApiEnvelope,
  PaginatedResult,
  UserGeneration,
} from "@/entities/order/types";

// Adapta una generación al shape `Product` que consume ProductCard: la imagen del
// arte (thumbnail o resultado) hace de "poster", el nombre de la mascota de título
// y el badge superpuesto reutiliza el estado de la generación.
function generationToProduct(generation: UserGeneration): Product {
  return {
    name: generation.pet?.name || "Untitled",
    desc: generation.style?.displayName || "",
    price: "",
    img:
      generation.thumbnailUrl ||
      generation.resultUrl ||
      "/placeholder-image.jpg",
    label: generationStatusBadge(generation.status).label,
  };
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

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      const isFirst = pageToLoad === 1;
      if (isFirst) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const res = await get<ApiEnvelope<PaginatedResult<UserGeneration>>>(
          `/generations?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        );
        const fetched = res.data?.data ?? [];
        setGenerations((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setTotalPages(res.data?.meta?.totalPages ?? 1);
        setPage(pageToLoad);
      } catch {
        setError("Couldn't load your artworks. Please try again.");
      } finally {
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 md:p-8">
        {isLoading && (
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-3/4 animate-pulse rounded-xl bg-cream"
              />
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
              href="/ia-generator"
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
            <div className="grid grid-cols-2 items-center gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {generations.map((generation) => {
                return (
                  <ProductCard
                    key={generation.id}
                    product={generationToProduct(generation)}
                    href={`/user/generations/${generation.id}`}
                    showPrice={false}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => loadPage(page + 1)}
                  disabled={isLoadingMore}
                  className="rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading…" : "Load more artworks"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
