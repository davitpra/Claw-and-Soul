import { ExpenseItem } from "@/entities/admin/api";

/**
 * Etiquetas del JSON `detail` que graba el backend al registrar un gasto
 * (`ExpensesService.recordGenerationCost` / `recordUpscaleCost`). Las claves
 * anidadas se aplanan con punto, así que se mapean con su ruta completa.
 */
const DETAIL_LABELS: Record<string, string> = {
  "vision.cost": "Análisis de visión",
  "vision.model": "Modelo de visión",
  "image.cost": "Generación",
  "image.model": "Modelo de generación",
  "image.unit": "Unidad de tarifa",
  outputMegapixels: "Megapíxeles de salida",
  ratePerMp: "Tarifa por megapíxel",
  factor: "Factor de escalado",
  model: "Modelo",
};

export interface DetailRow {
  label: string;
  value: string;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    // Los costes de IA bajan de la milésima; 6 decimales evitan mostrar "0".
    return Number.isInteger(value) ? String(value) : value.toFixed(6);
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/** Aplana el objeto recursivamente en rutas "a.b" → valor escalar. */
function flatten(input: Record<string, unknown>, prefix = ""): DetailRow[] {
  return Object.entries(input).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return flatten(value as Record<string, unknown>, path);
    }
    // Las claves sin etiqueta caen a su nombre crudo: un `detail` nuevo del
    // backend se ve raro pero nunca rompe la vista.
    return [{ label: DETAIL_LABELS[path] ?? path, value: stringify(value) }];
  });
}

/**
 * Convierte un gasto en las filas del desplegable técnico: el JSON `detail`
 * aplanado, más los metadatos de trazabilidad que viven fuera de él.
 */
export function expenseDetailRows(expense: ExpenseItem): DetailRow[] {
  const rows = expense.detail ? flatten(expense.detail) : [];

  if (expense.fxRate !== null) {
    rows.push({
      label: `Tasa de cambio (${expense.currency} → ${expense.baseCurrency})`,
      value: stringify(expense.fxRate),
    });
  }
  if (expense.providerRef) {
    rows.push({ label: "Referencia del proveedor", value: expense.providerRef });
  }
  rows.push({ label: "Origen", value: expense.source });

  return rows;
}
