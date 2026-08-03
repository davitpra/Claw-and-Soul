/**
 * Tokens compartidos de los gráficos del admin.
 *
 * recharts no lee las variables CSS de Polaris, así que los colores se fijan
 * aquí una vez en vez de repetirse literales por cada `<Line>`/`<Bar>`. El
 * acento es el mismo teal del tema (`polaris-overrides.css`).
 */

export const CHART_COLORS = {
  accent: "#448da6",
  accentSoft: "#8fbecd",
  positive: "#2e7d5b",
  critical: "#ef4444",
  warning: "#f59e0b",
  neutral: "#6b7280",
  // Serie sin carga semántica (altas de usuarios). No se usa `warning`, que en
  // el admin se lee como aviso, ni `neutral`, que apaga demasiado las barras.
  alt: "#7a6ea9",
} as const;

/** Colores por estado de generación, compartidos por dona y leyendas. */
export const GENERATION_STATUS_COLORS: Record<string, string> = {
  completed: CHART_COLORS.accent,
  failed: CHART_COLORS.critical,
  processing: CHART_COLORS.warning,
  pending: CHART_COLORS.neutral,
};

export const AXIS_TICK = { fontSize: 11, fill: "#6d7175" } as const;

export const GRID_STROKE = "#E3E3E3";

export const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: `1px solid ${GRID_STROKE}`,
  fontSize: 12,
} as const;

/** Etiqueta corta de día para los ejes: `3 ago`. */
export function fmtChartDay(day: string): string {
  return new Date(day).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}
