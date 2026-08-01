/**
 * Presentación de los movimientos del ledger de créditos, tal como los muestra
 * la pestaña "Créditos" del detalle de usuario (`app/admin/users/[id]`).
 */

import { fmtCurrency } from "./order-format";

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

/**
 * Costo en moneda base, con los mismos dos decimales que el resto de importes
 * del admin (`fmtCurrency`). `null` significa «este movimiento no tiene costo
 * asociado»: los bonos, packs y ajustes manuales son saldo concedido, no gasto.
 */
export function fmtCreditCost(cost: number | null, currency: string): string {
  if (cost === null) return "—";
  return fmtCurrency(cost, currency);
}

/**
 * Tarifas unitarias: el costo de UN crédito y su desglose vision/imagen viven
 * por debajo del céntimo (~CA$0,04 y ~CA$0,02), así que a dos decimales se
 * leerían como «0,00 $». Sólo para esas cifras, hasta cuatro decimales.
 */
export function fmtUnitCost(cost: number | null, currency: string): string {
  if (cost === null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(cost);
}
