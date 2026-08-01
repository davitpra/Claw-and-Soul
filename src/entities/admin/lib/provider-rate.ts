/**
 * Presentación de las tarifas de proveedor (`ProviderRate`). Las unidades son
 * las que entiende el backend al calcular el importe de un gasto: solo
 * `per_megapixel` dispara el cálculo por superficie, el resto son tarifa plana.
 */

export const RATE_UNIT_LABELS: Record<string, string> = {
  per_image: "por imagen",
  per_megapixel: "por megapíxel",
  per_call: "por llamada",
};

export const RATE_UNIT_OPTIONS = Object.entries(RATE_UNIT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/** Las tarifas bajan de la millonésima ($0.00005/MP): 2 decimales las ocultan. */
export function fmtRate(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 6,
  }).format(amount);
}
