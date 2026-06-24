/**
 * Helpers de presentación para el detalle de pedidos en el admin.
 * Centralizados para que las cards co-locadas (`app/admin/orders/[id]/*`)
 * compartan el mismo formato de fechas, moneda y direcciones.
 */

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatAddress(addr: Record<string, string> | null): string {
  if (!addr) return "—";
  return [
    [addr.first_name, addr.last_name].filter(Boolean).join(" "),
    addr.address1,
    addr.address2,
    [addr.city, addr.province, addr.zip].filter(Boolean).join(" "),
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");
}
