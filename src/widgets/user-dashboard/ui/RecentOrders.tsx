"use client";

import Link from "next/link";
import { useShopifyVariantImages } from "@/hooks/useShopifyVariantImages";
import {
  formatOrderDate,
  formatPrice,
  resolveItemImage,
  statusBadge,
} from "@/entities/order/lib/presentation";
import type { UserOrderListItem } from "@/entities/order/types";
import { EmptyState } from "./EmptyState";

interface Props {
  orders: UserOrderListItem[];
  isLoading: boolean;
  error: string | null;
}

function thumbFor(
  order: UserOrderListItem,
  variantImages: Record<string, string>,
) {
  const item = order.items?.[0];
  return item ? resolveItemImage(item, variantImages) : null;
}

function itemSummary(order: UserOrderListItem): string {
  const count = order.items?.length ?? 0;
  if (count === 0) return "No items";
  const first = order.items[0]?.title ?? "Item";
  return count === 1 ? first : `${first} +${count - 1} more`;
}

export function RecentOrders({ orders, isLoading, error }: Props) {
  // Imagen live de Shopify para ítems primarios sin imagen persistida (accesorios).
  const variantImages = useShopifyVariantImages(
    orders.map((o) => o.items?.[0]?.shopifyHandle),
  );

  return (
    <section className="rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-black text-text-main">
          Recent Orders
        </h2>
        <Link
          href="/user/orders"
          className="text-sm font-bold text-primary hover:text-primary-dark"
        >
          View all orders
        </Link>
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-cream" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            headingLevel="h3"
            icon="shopping_bag"
            title="No orders yet"
            description="When you place an order it will show up here."
            cta={{ href: "/catalog", icon: "storefront", label: "Start shopping" }}
          />
        )}

        {!isLoading && !error && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((order) => {
              const badge = statusBadge(order);
              const thumb = thumbFor(order, variantImages);
              return (
                <li key={order.id}>
                  <Link
                    href={`/user/orders/${order.id}`}
                    className="group flex items-center gap-4 rounded-xl bg-cream p-3 transition-all hover:bg-cream/60 hover:shadow-md"
                  >
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-white sm:size-20">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 p-2 rounded-2xl"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <span className="material-symbols-outlined text-[24px] text-text-muted">
                            image
                          </span>
                        </span>
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-text-main">
                        Order #{order.orderNumber}
                      </p>
                      <p className="truncate text-sm text-text-muted">
                        {itemSummary(order)}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {formatOrderDate(order.shopifyCreatedAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="font-bold text-text-main">
                        {formatPrice(order.totalAmount, order.currency)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <span className="material-symbols-outlined hidden text-[20px] text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block">
                      chevron_right
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
