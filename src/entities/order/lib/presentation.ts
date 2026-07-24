// Helpers de presentación para órdenes, compartidos por RecentOrders, AllOrders y
// OrderDetail. Antes estaban duplicados en cada widget.

import { variantNumericId } from "@/hooks/useShopifyVariantImages";
import type { Address, OrderItemThumb, UserOrderListItem } from "../types";

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Moneda inválida/desconocida: degradamos a número + código.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export interface StatusBadge {
  label: string;
  classes: string;
}

// Estado mostrado al cliente = estado de FULFILLMENT de Shopify (Shopify es la
// fuente de verdad del pedido/envío). Preferimos el "display status" derivado de
// los FulfillmentOrders (in_progress/on_hold/scheduled/...); si falta (órdenes
// viejas sin resync) caemos al fulfillment_status simple de la orden.
const FULFILLMENT_STATUS: Record<string, StatusBadge> = {
  unfulfilled: { label: "Unfulfilled", classes: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In progress", classes: "bg-blue-100 text-blue-700" },
  on_hold: { label: "On hold", classes: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", classes: "bg-blue-100 text-blue-700" },
  partially_fulfilled: {
    label: "Partially fulfilled",
    classes: "bg-blue-100 text-blue-700",
  },
  fulfilled: { label: "Fulfilled", classes: "bg-primary/10 text-primary" },
  restocked: { label: "Restocked", classes: "bg-gray-100 text-gray-600" },
};

// Fallback: estado simple de la orden (fulfillment_status) → clave canónica.
function simpleToDisplay(status: string | null | undefined): string {
  switch (status?.toLowerCase()) {
    case "fulfilled":
      return "fulfilled";
    case "partial":
      return "partially_fulfilled";
    case "restocked":
      return "restocked";
    default:
      return "unfulfilled";
  }
}

export function statusBadge(
  order: Pick<UserOrderListItem, "fulfillmentDisplayStatus" | "fulfillmentStatus">,
): StatusBadge {
  const key = (
    order.fulfillmentDisplayStatus ?? simpleToDisplay(order.fulfillmentStatus)
  ).toLowerCase();
  return (
    FULFILLMENT_STATUS[key] ?? {
      label: "Unfulfilled",
      classes: "bg-amber-100 text-amber-700",
    }
  );
}

// Estado de producción por item (productionStatus que devuelve /orders y /orders/:id).
const PRODUCTION_STATUS: Record<string, StatusBadge> = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", classes: "bg-blue-100 text-blue-700" },
  in_production: { label: "In production", classes: "bg-amber-100 text-amber-700" },
  shipped: { label: "Shipped", classes: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", classes: "bg-primary/10 text-primary" },
  cancelled: { label: "Cancelled", classes: "bg-gray-100 text-gray-600" },
  refunded: { label: "Refunded", classes: "bg-gray-100 text-gray-600" },
};

export function productionStatusBadge(
  status: string | null,
): StatusBadge | null {
  if (!status) return null;
  return (
    PRODUCTION_STATUS[status] ?? {
      label: status.replace(/_/g, " "),
      classes: "bg-gray-100 text-gray-600",
    }
  );
}

// Estado de una generación de IA (status que devuelve /generations).
const GENERATION_STATUS: Record<string, StatusBadge> = {
  completed: { label: "Ready", classes: "bg-primary/10 text-primary" },
  processing: { label: "Processing", classes: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  failed: { label: "Failed", classes: "bg-red-100 text-red-700" },
};

export function generationStatusBadge(status: string): StatusBadge {
  return (
    GENERATION_STATUS[status?.toLowerCase()] ?? {
      label: status
        ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Unknown",
      classes: "bg-gray-100 text-gray-600",
    }
  );
}

// Mejor imagen disponible para un item: thumbnail de generación → resultado →
// imagen del item → imagen primaria del estilo (catálogo) como último fallback.
export function itemThumb(item: OrderItemThumb): string | null {
  return (
    item.generation?.thumbnailUrl ||
    item.generation?.resultUrl ||
    item.imageUrl ||
    item.productImageUrl ||
    null
  );
}

// Como `itemThumb`, pero con un último recurso: la imagen live de la variante de
// Shopify (mapa `variantNumericId → url` de `useShopifyVariantImages`). Cubre
// ítems sin ninguna imagen persistida, como accesorios sin estilo ni generación.
export function resolveItemImage(
  item: OrderItemThumb,
  variantImages: Record<string, string>,
): string | null {
  const persisted = itemThumb(item);
  if (persisted) return persisted;
  const numericId = variantNumericId(item.shopifyVariantId);
  return (numericId && variantImages[numericId]) || null;
}

// Aplana una dirección de envío (JSON libre de Shopify) a una sola línea legible.
export function formatAddress(addr: Address | null | undefined): string {
  if (!addr) return "";
  return [
    [addr.first_name, addr.last_name].filter(Boolean).join(" ") || addr.name,
    addr.company,
    addr.address1,
    addr.address2,
    [addr.city, addr.province, addr.zip].filter(Boolean).join(" "),
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");
}

// Estado de pago de Shopify (paid|pending|refunded|...) a texto legible.
export function formatFinancialStatus(
  status: string | null | undefined,
): string | null {
  if (!status) return null;
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
