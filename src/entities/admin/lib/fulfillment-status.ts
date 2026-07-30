import type { BadgeProps } from "@shopify/polaris";

/**
 * Presentación (admin Polaris) del estado de FULFILLMENT de Shopify — la fuente
 * de verdad del pedido. Mismo vocabulario que el storefront
 * (`entities/order/lib/presentation.ts`), portado a tones de Polaris.
 *
 * `fulfillmentDisplayStatus` lo deriva el backend de los FulfillmentOrders y se
 * mantiene fresco con webhooks `fulfillment_orders/*` + el cron reconciliador.
 */
export const FULFILLMENT_DISPLAY_LABELS: Record<string, string> = {
  unfulfilled: "Unfulfilled",
  in_progress: "In progress",
  on_hold: "On hold",
  scheduled: "Scheduled",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  restocked: "Restocked",
};

export const FULFILLMENT_DISPLAY_TONES: Record<string, BadgeProps["tone"]> = {
  unfulfilled: "attention",
  in_progress: "info",
  on_hold: "warning",
  scheduled: "info",
  partially_fulfilled: "info",
  fulfilled: "success",
  restocked: "enabled",
};

/** Estado simple de la orden (fulfillment_status) → clave canónica de display. */
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

/**
 * Estado de fulfillment canónico de un pedido: preferimos el display status
 * (rico) y caemos al fulfillment_status simple si falta (órdenes viejas sin
 * resync).
 */
export function resolveFulfillmentStatus(order: {
  fulfillmentDisplayStatus: string | null;
  fulfillmentStatus: string | null;
}): string {
  return (
    order.fulfillmentDisplayStatus ?? simpleToDisplay(order.fulfillmentStatus)
  ).toLowerCase();
}

export function fulfillmentLabel(status: string): string {
  return FULFILLMENT_DISPLAY_LABELS[status] ?? status;
}

export function fulfillmentTone(status: string): BadgeProps["tone"] {
  return FULFILLMENT_DISPLAY_TONES[status] ?? "enabled";
}
