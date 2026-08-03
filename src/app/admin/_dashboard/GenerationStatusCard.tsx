"use client";

import { BlockStack, Card, Divider, Text } from "@shopify/polaris";
import { OverviewPipeline } from "@/entities/admin/api";
import { generationStatusLabel } from "@/entities/admin/lib/generation-status";
import { DonutChart, DonutSlice } from "./charts/DonutChart";
import { CHART_COLORS, GENERATION_STATUS_COLORS } from "./charts/chart-theme";
import { StatLine } from "./StatLine";
import { fmtCount, fmtPct } from "./format";

/**
 * Reparto de las generaciones del periodo por estado.
 *
 * Acompaña a `PipelineHealthCard`, que da las cifras de rendimiento (tiempos,
 * costo, tasa de fallo); aquí solo se ve la proporción, que es lo que una tabla
 * de cuatro números no comunica de un vistazo.
 */
export function GenerationStatusCard({
  pipeline,
}: {
  pipeline: OverviewPipeline;
}) {
  const slices: DonutSlice[] = Object.entries(pipeline.byStatus).map(
    ([status, value]) => ({
      name: generationStatusLabel(status),
      value,
      // Un estado nuevo del backend cae en el neutro en vez de quedarse sin color.
      color: GENERATION_STATUS_COLORS[status] ?? CHART_COLORS.neutral,
    }),
  );

  const share = (value: number) =>
    pipeline.total ? (value / pipeline.total) * 100 : null;

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">
          Estados de generación
        </Text>

        <DonutChart
          data={slices}
          emptyMessage="Sin generaciones en este periodo."
          format={fmtCount}
        />

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Completadas"
            value={fmtCount(pipeline.completed)}
            detail={fmtPct(share(pipeline.completed))}
          />
          <StatLine
            label="Fallidas"
            value={fmtCount(pipeline.failed)}
            detail={fmtPct(share(pipeline.failed))}
            tone={pipeline.failed > 0 ? "critical" : undefined}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
