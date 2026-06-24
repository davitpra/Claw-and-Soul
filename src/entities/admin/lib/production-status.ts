import type { BadgeProps } from "@shopify/polaris";

/**
 * Fuente única (admin) para la presentación del `productionStatus` por item.
 * Antes estaba triplicado en la lista, el detalle y el storefront. El storefront
 * (`entities/order/lib/presentation.ts`) es otro eje (fulfillment de Shopify,
 * Tailwind) y NO se centraliza aquí.
 */
export const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  mixed: "Mixto",
};

export const PRODUCTION_STATUS_TONES: Record<string, BadgeProps["tone"]> = {
  pending: "attention",
  paid: "info",
  in_production: "warning",
  shipped: "attention",
  delivered: "success",
  cancelled: "enabled",
  refunded: "critical",
  mixed: "enabled",
};

export function productionStatusLabel(status: string): string {
  return PRODUCTION_STATUS_LABELS[status] ?? status;
}

export function productionStatusTone(status: string): BadgeProps["tone"] {
  return PRODUCTION_STATUS_TONES[status] ?? "enabled";
}
