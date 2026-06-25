import { PRODUCTION_STATUS_LABELS } from "./production-status";

/**
 * Catálogos de opciones para los filtros de la lista de pedidos (admin).
 * Cada opción mapea un `value` (en inglés, el que viaja a la API) a su `label`
 * (en español, el que ve el usuario). Se consumen en dos sitios: alimentan los
 * `<ChoiceList>` y resuelven la etiqueta del chip activo vía `filterOptionLabel`.
 */
export type FilterOption = { label: string; value: string };

/** Estados de producción filtrables (todos los valores almacenados, en orden de
 * pipeline; se excluye `mixed`, que es solo una agregación de frontend). Las
 * etiquetas se derivan del catálogo para no duplicar la traducción. */
export const STATUS_OPTIONS: FilterOption[] = [
  "pending",
  "generating",
  "art_failed",
  "draft",
  "pre_production",
  "in_production",
  "printed",
  "shipped",
  "delivered",
  "on_hold",
  "cancelled",
  "refunded",
  "restocked",
].map((value) => ({ value, label: PRODUCTION_STATUS_LABELS[value] }));

export const METHOD_OPTIONS: FilterOption[] = [
  { label: "Taller", value: "in_house" },
  { label: "POD", value: "pod" },
];

// Estado de fulfillment de Shopify (columna `fulfillment_status`). "unfulfilled"
// representa el valor null que devuelve Shopify cuando aún no hay fulfillment.
export const FULFILLMENT_OPTIONS: FilterOption[] = [
  { label: "Unfulfilled", value: "unfulfilled" },
  { label: "Partially fulfilled", value: "partial" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Restocked", value: "restocked" },
];

/** Etiqueta del chip de filtro activo a partir de su `value`. Estrategia única
 * para los tres filtros (antes cada uno la resolvía a su manera). */
export function filterOptionLabel(
  options: FilterOption[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
