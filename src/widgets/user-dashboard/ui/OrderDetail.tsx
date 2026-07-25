"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useShopifyVariantImages } from "@/hooks/useShopifyVariantImages";
import { useStyleData } from "@/entities/product/api/useStyleData";
import { isNotFound } from "@/shared/lib/http";
import SectionHeading from "@/shared/ui/SectionHeading";
import { DetailErrorState } from "@/shared/ui/DetailErrorState";
import { DetailNotFound } from "@/shared/ui/DetailNotFound";
import {
  formatAddress,
  formatOrderDate,
} from "@/entities/order/lib/presentation";
import { BackToOrdersLink } from "@/entities/order/ui/BackToOrdersLink";
import { OrderItemRow } from "@/entities/order/ui/OrderItemRow";
import { OrderStatusBadge } from "@/entities/order/ui/OrderStatusBadge";
import { OrderSummary } from "@/entities/order/ui/OrderSummary";
import type { ApiEnvelope, UserOrderDetail } from "@/entities/order/types";

interface Props {
  id: string;
}

export function OrderDetail({ id }: Props) {
  const { get } = useAuthFetch();

  const [order, setOrder] = useState<UserOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await get<ApiEnvelope<UserOrderDetail>>(`/orders/${id}`);
      setOrder(res.data ?? null);
    } catch (err) {
      if (isNotFound(err)) setNotFound(true);
      else setError("Couldn't load this order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Resuelve, best-effort, la imagen live de Shopify de los ítems sin imagen
  // persistida (accesorios). El hook se llama incondicionalmente (antes de los
  // early returns) para respetar las reglas de hooks; con orden vacía es no-op.
  const variantImages = useShopifyVariantImages(
    (order?.items ?? []).map((item) => item.shopifyHandle),
  );

  // Template/formato del backend por handle (mismo origen que el catálogo), para
  // darle a cada ítem el marco visual de su tipo de producto.
  const styleData = useStyleData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl bg-white p-6 md:p-8">
          <div className="h-5 w-32 animate-pulse rounded bg-cream" />
          <div className="mt-5 h-8 w-56 animate-pulse rounded-xl bg-cream" />
          <div className="mt-3 h-4 w-40 animate-pulse rounded bg-cream" />
        </section>
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl bg-white p-6 md:p-8 lg:col-span-2">
            <div className="h-6 w-28 animate-pulse rounded bg-cream" />
            <div className="mt-4 space-y-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-26 animate-pulse rounded-xl bg-cream"
                />
              ))}
            </div>
          </section>
          <section className="rounded-xl bg-white p-6">
            <div className="h-6 w-24 animate-pulse rounded bg-cream" />
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-cream" />
          </section>
        </div>
      </div>
    );
  }

  if (notFound || (!order && !error)) {
    return (
      <DetailNotFound
        icon="receipt_long"
        title="Order not found"
        message="We couldn't find this order in your account."
        backHref="/user/orders"
        backLabel="Back to orders"
      />
    );
  }

  if (error || !order) {
    return (
      <DetailErrorState
        back={<BackToOrdersLink />}
        message={error ?? "Couldn't load this order."}
        onRetry={load}
      />
    );
  }

  const items = order.items ?? [];
  const itemCount = items.length;
  const address = formatAddress(order.shippingAddress);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 md:p-8">
        <BackToOrdersLink />
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-black text-text-main md:text-3xl">
                Order {order.orderNumber}
              </h1>
              <OrderStatusBadge order={order} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-text-muted">
              <span className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              {formatOrderDate(order.shopifyCreatedAt)}
              <span className="text-text-muted/50">·</span>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          {order.orderStatusUrl && (
            <a
              href={order.orderStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                local_shipping
              </span>
              Track shipping
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
            </a>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-6 md:p-8 lg:col-span-2">
          <SectionHeading
            icon="shopping_bag"
            title="Items"
            trailing={
              itemCount > 0 ? (
                <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-bold text-text-muted">
                  {itemCount}
                </span>
              ) : undefined
            }
          />
          {itemCount === 0 ? (
            <p className="mt-4 rounded-xl bg-cream px-4 py-8 text-center text-text-muted">
              No items in this order.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  variantImages={variantImages}
                  styleData={styleData}
                />
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl bg-white p-6">
            <SectionHeading icon="receipt_long" title="Summary" />
            <OrderSummary order={order} />
          </section>

          {address && (
            <section className="rounded-xl bg-white p-6">
              <SectionHeading icon="location_on" title="Shipping address" />
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {address}
              </p>
              {order.shippingAddress?.phone && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                  <span className="material-symbols-outlined text-[16px]">
                    call
                  </span>
                  {order.shippingAddress.phone}
                </p>
              )}
            </section>
          )}

          {order.customerNote && (
            <section className="rounded-xl bg-white p-6">
              <SectionHeading icon="sticky_note_2" title="Note" />
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {order.customerNote}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
