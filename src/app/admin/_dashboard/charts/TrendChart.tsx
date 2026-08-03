"use client";

import { Text } from "@shopify/polaris";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_TICK,
  GRID_STROKE,
  TOOLTIP_STYLE,
  fmtChartDay,
} from "./chart-theme";

export interface TrendSeries {
  dataKey: string;
  name: string;
  color: string;
  /** Eje propio: mezclar dinero y unidades en una escala aplana la curva. */
  axis?: "left" | "right";
  /**
   * `bar` para conteos e importes diarios: sobre datos dispersos una línea traza
   * una pendiente entre dos días con actividad, sugiriendo un descenso gradual
   * donde en realidad hubo ceros. Las barras dejan el hueco a la vista.
   */
  kind?: "area" | "line" | "bar";
  format?: (value: number) => string;
}

interface TrendChartProps {
  data: Record<string, unknown>[];
  series: TrendSeries[];
  height?: number;
  emptyMessage?: string;
  /** Rótulo del eje izquierdo. Sin él, un eje de dinero no declara su unidad. */
  yTickFormat?: (value: number) => string;
}

/**
 * Serie temporal del dashboard.
 *
 * Admite un segundo eje, pero conviene evitarlo: con dos escalas arbitrarias el
 * cruce de dos series no significa nada y sin embargo se lee como correlación.
 * Úsalo con una sola serie salvo que las magnitudes sean comparables.
 */
export function TrendChart({
  data,
  series,
  height = 240,
  emptyMessage = "Sin datos en este periodo.",
  yTickFormat,
}: TrendChartProps) {
  const hasData = data.some((point) =>
    series.some((s) => Number(point[s.dataKey] ?? 0) > 0),
  );

  if (!hasData) {
    return (
      <Text as="p" tone="subdued">
        {emptyMessage}
      </Text>
    );
  }

  const usesRightAxis = series.some((s) => s.axis === "right");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
        <XAxis
          dataKey="day"
          tickFormatter={fmtChartDay}
          tick={AXIS_TICK}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={AXIS_TICK}
          allowDecimals={false}
          tickFormatter={yTickFormat}
          width={yTickFormat ? 56 : undefined}
        />
        {usesRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={AXIS_TICK}
            allowDecimals={false}
          />
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(value) => fmtChartDay(String(value))}
          formatter={(value, name) => {
            const match = series.find((s) => s.name === name);
            const numeric = Number(value);
            return [match?.format ? match.format(numeric) : numeric, name];
          }}
        />
        {/* Con una sola serie la leyenda repite el título de la card. */}
        {series.length > 1 && (
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        )}

        {series.map((s) =>
          s.kind === "bar" ? (
            <Bar
              key={s.dataKey}
              yAxisId={s.axis ?? "left"}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
            />
          ) : s.kind === "area" ? (
            <Area
              key={s.dataKey}
              yAxisId={s.axis ?? "left"}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.12}
              dot={false}
            />
          ) : (
            <Line
              key={s.dataKey}
              yAxisId={s.axis ?? "left"}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
