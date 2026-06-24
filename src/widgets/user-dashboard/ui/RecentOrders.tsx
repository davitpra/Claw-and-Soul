"use client";

import Link from "next/link";
import {
  formatOrderDate,
  itemThumb,
  statusBadge,
} from "@/entities/order/lib/presentation";
import type { UserOrderListItem } from "@/entities/order/types";

interface Props {
  orders: UserOrderListItem[];
  isLoading: boolean;
  error: string | null;
}

function thumbFor(order: UserOrderListItem) {
  const item = order.items?.[0];
  return item ? itemThumb(item) : null;
}

export function RecentOrders({ orders, isLoading, error }: Props) {
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
          <div className="rounded-xl bg-cream px-4 py-8 text-center">
            <p className="text-text-muted">You have no orders yet.</p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
            >
              Start shopping
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((order) => {
              const badge = statusBadge(order);
              const thumb = thumbFor(order);
              return (
                <li
                  key={order.id}
                  className="flex items-center gap-4 rounded-xl bg-cream p-3"
                >
                  <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
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
                    <p className="text-sm text-text-muted">
                      {formatOrderDate(order.shopifyCreatedAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.classes}`}
                  >
                    {badge.label}
                  </span>

                  <span className="w-20 text-right font-bold text-text-main">
                    {order.currency === "USD" ? "$" : ""}
                    {order.totalAmount.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
