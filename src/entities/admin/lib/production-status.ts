import type { BadgeProps } from "@shopify/polaris";
import { OrderItemKind } from "./order-item-kind";

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

/**
 * Etiquetas que cambian cuando el item es un accesorio: no hay arte que quede en
 * borrador, el item solo está pendiente de preparar y enviar.
 */
const ACCESSORY_STATUS_LABELS: Record<string, string> = {
  draft: "Por preparar",
};

export function productionStatusLabel(
  status: string,
  kind: OrderItemKind = "art",
): string {
  if (kind === "accessory" && ACCESSORY_STATUS_LABELS[status]) {
    return ACCESSORY_STATUS_LABELS[status];
  }
  return PRODUCTION_STATUS_LABELS[status] ?? status;
}

export function productionStatusTone(status: string): BadgeProps["tone"] {
  return PRODUCTION_STATUS_TONES[status] ?? "enabled";
}
