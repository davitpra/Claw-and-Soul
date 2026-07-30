/**
 * Presentación del estado de un Paint by Numbers guardado en el admin.
 * Centralizado para que cualquier vista que liste PBNs pinte el mismo label y
 * el mismo tono para un mismo estado.
 */

const TONES: Record<string, "success" | "info" | "enabled"> = {
  // Guardado en la galería del usuario: aún puede editarlo o borrarlo.
  saved: "enabled",
  // Ya comprado: la fila quedó congelada como origen de un OrderItem.
  ordered: "success",
};

const LABELS: Record<string, string> = {
  saved: "Guardado",
  ordered: "Comprado",
};

/** Tono del `<Badge>`. Cualquier estado desconocido cae en el neutro. */
export function pbnStatusTone(status: string): "success" | "info" | "enabled" {
  return TONES[status] ?? "enabled";
}

/** Label en español; si el backend añade un estado nuevo se muestra crudo. */
export function pbnStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}
