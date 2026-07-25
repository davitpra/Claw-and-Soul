import { generationStatusBadge } from "../lib/presentation";

interface GenerationStatusBadgeProps {
  status: string;
}

/**
 * Pill con el estado de una generación de IA (Ready/Processing/Pending/Failed).
 * El color y la etiqueta se derivan en `generationStatusBadge`.
 */
export function GenerationStatusBadge({ status }: GenerationStatusBadgeProps) {
  const badge = generationStatusBadge(status);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.classes}`}
    >
      {badge.label}
    </span>
  );
}
