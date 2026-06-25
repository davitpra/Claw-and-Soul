import type { BadgeProps } from "@shopify/polaris";

/**
 * Fuente única (admin) para la presentación del `productionStatus` por item.
 * Antes estaba triplicado en la lista, el detalle y el storefront. El storefront
 * (`entities/order/lib/presentation.ts`) es otro eje (fulfillment de Shopify,
 * Tailwind) y NO se centraliza aquí.
 */
export const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pago pendiente",
  generating: "Generando arte",
  art_failed: "Error de arte",
  draft: "Borrador",
  pre_production: "Pre-producción",
  in_production: "En producción",
  printed: "Impreso",
  shipped: "Enviado",
  delivered: "Entregado",
  on_hold: "En espera",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  restocked: "Reabastecido",
  mixed: "Mixto",
};

export const PRODUCTION_STATUS_TONES: Record<string, BadgeProps["tone"]> = {
  pending: "attention",
  generating: "info",
  art_failed: "critical",
  draft: "info",
  pre_production: "info",
  in_production: "warning",
  printed: "warning",
  shipped: "attention",
  delivered: "success",
  on_hold: "warning",
  cancelled: "enabled",
  refunded: "critical",
  restocked: "enabled",
  mixed: "enabled",
};

export function productionStatusLabel(status: string): string {
  return PRODUCTION_STATUS_LABELS[status] ?? status;
}

export function productionStatusTone(status: string): BadgeProps["tone"] {
  return PRODUCTION_STATUS_TONES[status] ?? "enabled";
}
