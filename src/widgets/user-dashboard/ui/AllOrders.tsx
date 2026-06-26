"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import type { Product } from "@/entities/pet-product/model/types";
import {
  formatOrderDate,
  formatPrice,
  itemThumb,
  statusBadge,
} from "@/entities/order/lib/presentation";
import type {
  ApiEnvelope,
  PaginatedResult,
  UserOrderListItem,
} from "@/entities/order/types";

// Adapta una orden al shape `Product` que consume ProductCard: la imagen del
// item principal hace de "poster", el número de orden de nombre y el total de
// precio. El badge superpuesto reutiliza el estado de fulfillment de la orden.
function orderToProduct(order: UserOrderListItem): Product {
  const primary = order.items?.[0];
  return {
    name: `Order ${order.orderNumber}`,
    desc: "",
    price: formatPrice(order.totalAmount, order.currency),
    img: (primary ? itemThumb(primary) : null) ?? "/placeholder-image.jpg",
    label: statusBadge(order).label,
  };
}

const PAGE_SIZE = 10;

export function AllOrders() {
  const { get } = useAuthFetch();

  const [orders, setOrders] = useState<UserOrderListItem[]>([]);
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
        const res = await get<ApiEnvelope<PaginatedResult<UserOrderListItem>>>(
          `/orders?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        );
        const fetched = res.data?.data ?? [];
        setOrders((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setTotalPages(res.data?.meta?.totalPages ?? 1);
        setPage(pageToLoad);
      } catch {
        setError("Couldn't load your orders. Please try again.");
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
                className="aspect-[3/4] animate-pulse rounded-xl bg-cream"
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

        {!isLoading && !error && orders.length === 0 && (
          <div className="px-4 py-8 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
              <span className="material-symbols-outlined text-[32px]">
                shopping_bag
              </span>
            </span>
            <h2 className="mt-4 font-display text-xl font-black text-text-main">
              No orders yet
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              When you place an order it will show up here.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Start shopping
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <>
            <div className="grid grid-cols-2 items-center gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {orders.map((order) => {
                return (
                  <ProductCard
                    key={order.id}
                    product={orderToProduct(order)}
                    href={`/user/orders/${order.id}`}
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
                  {isLoadingMore ? "Loading…" : "Load more orders"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
