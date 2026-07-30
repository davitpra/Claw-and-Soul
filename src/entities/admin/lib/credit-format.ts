/**
 * Presentación de los movimientos del ledger de créditos, tal como los muestra
 * la pestaña "Créditos" del detalle de usuario (`app/admin/users/[id]`).
 */

const REASON_LABELS: Record<string, string> = {
  signup_bonus: "Bono de registro",
  order_bonus: "Bono por compra",
  pack_purchase: "Compra de pack",
  admin_grant: "Ajuste manual",
  generation_spend: "Generación de imagen",
  generation_refund: "Reembolso de generación",
  order_bonus_reversal: "Reversa de bono por compra",
  pack_purchase_reversal: "Reversa de compra de pack",
};

/** Motivo legible; un `reason` nuevo del backend cae a su valor crudo. */
export function creditReasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? reason;
}

/** Monto con signo explícito: los abonos se leen como `+5`. */
export function fmtCreditAmount(amount: number): string {
  return `${amount >= 0 ? "+" : ""}${amount}`;
}

/** Tono del `<Badge>` del monto: verde si suma, rojo si resta. */
export function creditAmountTone(amount: number): "success" | "critical" {
  return amount >= 0 ? "success" : "critical";
}
