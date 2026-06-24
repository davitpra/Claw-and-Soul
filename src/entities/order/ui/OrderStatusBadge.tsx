import { statusBadge } from "../lib/presentation";
import type { UserOrderListItem } from "../types";

interface OrderStatusBadgeProps {
  order: Pick<
    UserOrderListItem,
    "fulfillmentDisplayStatus" | "fulfillmentStatus"
  >;
}

/**
 * Pill con el estado de fulfillment de Shopify de una orden.
 * El color y la etiqueta se derivan en `statusBadge`.
 */
export function OrderStatusBadge({ order }: OrderStatusBadgeProps) {
  const badge = statusBadge(order);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.classes}`}
    >
      {badge.label}
    </span>
  );
}
