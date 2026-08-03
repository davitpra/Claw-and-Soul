/**
 * Formato de las cifras del dashboard. Vive junto a la ruta porque solo lo usan
 * sus cards; el formato de moneda y de costos se reutiliza de
 * `entities/admin/lib/*` en vez de duplicarse aquí.
 */

/** Entero con separador de miles; `null` se muestra como guion, no como 0. */
export function fmtCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("es-ES");
}

/** Porcentaje ya en escala 0-100. */
export function fmtPct(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return `${value.toLocaleString("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

/** Variación con signo explícito: `+12,4 %`. */
export function fmtDelta(value: number | null): string | null {
  if (value === null) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  })} %`;
}

/**
 * Tono del delta. Ojo: en la tasa de fallo subir es malo, así que quien la pinte
 * pasa `invert`.
 */
export function deltaTone(
  value: number | null,
  invert = false,
): "success" | "critical" | undefined {
  if (value === null || value === 0) return undefined;
  const positive = invert ? value < 0 : value > 0;
  return positive ? "success" : "critical";
}

/**
 * Importe abreviado para los rótulos del eje: `400 $`, `1,2 mil $`.
 *
 * El eje necesita etiquetas cortas o se solapan; el tooltip sigue usando
 * `fmtCurrency`, que da la cifra exacta.
 */
export function fmtCompactCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Segundos a `1 m 12 s` / `45 s`. */
export function fmtDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded} s`;
  const minutes = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${minutes} m ${rest} s` : `${minutes} m`;
}

/** Antigüedad legible de una fecha: `hace 3 días`. */
export function fmtAge(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `hace ${days} día${days === 1 ? "" : "s"}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `hace ${hours} h`;
  const minutes = Math.max(Math.floor(ms / 60_000), 0);
  return `hace ${minutes} min`;
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
