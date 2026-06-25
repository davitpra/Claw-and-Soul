import type { BadgeProps } from "@shopify/polaris";

/**
 * Presentación (admin Polaris) del estado de PAGO de Shopify (`financialStatus`).
 * Vocabulario de Shopify: pending, authorized, partially_paid, paid,
 * partially_refunded, refunded, voided.
 */
export const FINANCIAL_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  authorized: "Autorizado",
  partially_paid: "Pago parcial",
  paid: "Pagado",
  partially_refunded: "Reembolso parcial",
  refunded: "Reembolsado",
  voided: "Anulado",
};

export const FINANCIAL_STATUS_TONES: Record<string, BadgeProps["tone"]> = {
  pending: "attention",
  authorized: "info",
  partially_paid: "warning",
  paid: "success",
  partially_refunded: "warning",
  refunded: "enabled",
  voided: "critical",
};

export function financialLabel(status: string | null | undefined): string {
  if (!status) return "—";
  const key = status.toLowerCase();
  return FINANCIAL_STATUS_LABELS[key] ?? status;
}

export function financialTone(
  status: string | null | undefined,
): BadgeProps["tone"] {
  if (!status) return "enabled";
  return FINANCIAL_STATUS_TONES[status.toLowerCase()] ?? "enabled";
}
