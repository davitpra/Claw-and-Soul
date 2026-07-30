import type { BadgeProps } from "@shopify/polaris";

/**
 * Fuente única (admin) para la presentación del estado de la sincronización de
 * productos con Shopify. Antes estaba duplicado: un ternario en la lista de
 * productos y un `SYNC_STATUS_TONES` local en el dashboard.
 *
 * Una sincronización en curso va en `attention`, no en `warning`: es un estado
 * transitorio normal, no algo que requiera intervención.
 */
export const SYNC_STATUS_TONES: Record<string, BadgeProps["tone"]> = {
  completed: "success",
  failed: "critical",
  running: "attention",
  pending: "attention",
};

export function syncStatusTone(status: string): BadgeProps["tone"] {
  return SYNC_STATUS_TONES[status] ?? "enabled";
}
