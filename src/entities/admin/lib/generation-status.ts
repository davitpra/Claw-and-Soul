/**
 * Presentación del estado de una generación de IA en el admin.
 * Centralizado para que el detalle de usuario y cualquier otra vista que liste
 * generaciones pinten el mismo label y el mismo tono para un mismo estado.
 */

const TONES: Record<string, "success" | "critical" | "warning" | "enabled"> = {
  completed: "success",
  failed: "critical",
  processing: "warning",
  pending: "enabled",
};

const LABELS: Record<string, string> = {
  completed: "Completada",
  failed: "Fallida",
  processing: "Procesando",
  pending: "Pendiente",
};

/** Tono del `<Badge>`. Cualquier estado desconocido cae en el neutro. */
export function generationStatusTone(
  status: string,
): "success" | "critical" | "warning" | "enabled" {
  return TONES[status] ?? "enabled";
}

/** Label en español; si el backend añade un estado nuevo se muestra crudo. */
export function generationStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}
