"use client";

import { Text } from "@shopify/polaris";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS, TOOLTIP_STYLE } from "./chart-theme";

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
  emptyMessage?: string;
  format?: (value: number) => string;
}

/** Dona de reparto. Omite los segmentos en cero para no ensuciar la leyenda. */
export function DonutChart({
  data,
  height = 200,
  emptyMessage = "Sin datos.",
  format,
}: DonutChartProps) {
  const slices = data.filter((slice) => slice.value > 0);

  if (slices.length === 0) {
    return (
      <Text as="p" tone="subdued">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={slices}
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          dataKey="value"
          paddingAngle={3}
        >
          {slices.map((slice) => (
            <Cell
              key={slice.name}
              fill={slice.color ?? CHART_COLORS.neutral}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) =>
            format ? format(Number(value)) : Number(value).toLocaleString("es-ES")
          }
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
