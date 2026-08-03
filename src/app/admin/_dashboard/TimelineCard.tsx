"use client";

import { BlockStack, Card, Text } from "@shopify/polaris";
import { OverviewStats } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { TrendChart, TrendSeries } from "./charts/TrendChart";
import { CHART_COLORS } from "./charts/chart-theme";
import { fmtCompactCurrency, fmtCount } from "./format";

export type TimelineMetric = "revenue" | "orders" | "generations" | "newUsers";

const METRIC_TITLES: Record<TimelineMetric, string> = {
  revenue: "Ingresos por día",
  orders: "Pedidos por día",
  generations: "Generaciones por día",
  newUsers: "Usuarios por día",
};

/**
 * Una entrada por métrica. Se resuelve con un mapa y no con una cadena de
 * ternarios para que añadir una serie nueva no toque el flujo de control.
 */
function buildSeries(currency: string): Record<TimelineMetric, TrendSeries> {
  return {
    revenue: {
      dataKey: "revenue",
      name: "Ingresos",
      color: CHART_COLORS.accent,
      kind: "bar",
      format: (value) => fmtCurrency(value, currency),
    },
    orders: {
      dataKey: "orders",
      name: "Pedidos",
      color: CHART_COLORS.positive,
      kind: "bar",
      format: fmtCount,
    },
    generations: {
      dataKey: "generations",
      name: "Generaciones",
      color: CHART_COLORS.accentSoft,
      kind: "bar",
      format: fmtCount,
    },
    newUsers: {
      dataKey: "newUsers",
      name: "Usuarios",
      color: CHART_COLORS.alt,
      kind: "bar",
      format: fmtCount,
    },
  };
}

interface TimelineCardProps {
  timeline: OverviewStats["timeline"];
  /** La marca el selector de sección de la página; ver `sections.ts`. */
  metric: TimelineMetric;
  currency: string;
  periodLabel: string;
}

/**
 * Serie diaria del dashboard.
 *
 * Se pinta **una sola métrica a la vez** a propósito: una versión anterior
 * superponía ingresos, pedidos y generaciones sobre dos ejes de escalas
 * arbitrarias, donde el cruce de dos series no significaba nada y aun así se
 * leía como correlación.
 *
 * Cuál se pinta ya no lo decide un selector propio: lo hereda de la sección
 * activa, para que un único control gobierne toda la página. Los cuatro campos
 * vienen en el mismo `timeline`, así que cambiar de serie no dispara ningún fetch.
 */
export function TimelineCard({
  timeline,
  metric,
  currency,
  periodLabel,
}: TimelineCardProps) {
  const series = buildSeries(currency)[metric];

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          {METRIC_TITLES[metric]}
        </Text>

        <TrendChart
          data={timeline}
          height={260}
          series={[series]}
          emptyMessage={`Sin datos en los últimos ${periodLabel}.`}
          // Solo el dinero necesita rótulo de unidad en el eje; los conteos se
          // leen solos y un formateador abreviado los estropearía ("1 mil").
          yTickFormat={
            metric === "revenue"
              ? (value) => fmtCompactCurrency(value, currency)
              : undefined
          }
        />
      </BlockStack>
    </Card>
  );
}
