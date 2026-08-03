"use client";

import { BlockStack, Card, Divider, InlineStack, Text } from "@shopify/polaris";
import { OverviewPipeline } from "@/entities/admin/api";
import { fmtUnitCost } from "@/entities/admin/lib/credit-format";
import { deltaTone, fmtCount, fmtDelta, fmtDuration, fmtPct } from "./format";

/**
 * Salud del pipeline de IA. Todas las cifras excluyen las generaciones de
 * prueba del admin (`isAdminTest`), que antes inflaban la tasa de fallo.
 *
 * La evolución diaria de generaciones no vive aquí: `TimelineCard` ya la ofrece
 * en su selector de métrica.
 */
export function PipelineHealthCard({
  pipeline,
  currency,
}: {
  pipeline: OverviewPipeline;
  currency: string;
}) {
  // Subir la tasa de fallo es malo: el delta va invertido respecto al resto.
  const failureDelta =
    pipeline.failureRate !== null && pipeline.failureRatePrev !== null
      ? pipeline.failureRate - pipeline.failureRatePrev
      : null;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Pipeline de IA
          </Text>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtCount(pipeline.total)}
            </Text>
            {fmtDelta(pipeline.totalDeltaPct) && (
              <Text
                variant="bodySm"
                as="span"
                tone={deltaTone(pipeline.totalDeltaPct)}
              >
                {fmtDelta(pipeline.totalDeltaPct)}
              </Text>
            )}
          </InlineStack>
        </InlineStack>

        <Divider />

        <BlockStack gap="150">
          <MetricLine
            label="Tasa de fallo"
            value={fmtPct(pipeline.failureRate)}
            detail={
              failureDelta === null
                ? undefined
                : `${fmtDelta(failureDelta)} vs. periodo anterior`
            }
            tone={deltaTone(failureDelta, true)}
          />
          <MetricLine
            label="Tiempo medio · p95"
            value={`${fmtDuration(pipeline.avgProcessingSeconds)} · ${fmtDuration(
              pipeline.p95ProcessingSeconds,
            )}`}
          />
          <MetricLine
            label="Imagen"
            value={`${fmtCount(pipeline.byType.image)}`}
          />
          <MetricLine
            label="Costo por generación"
            value={fmtUnitCost(pipeline.costPerGeneration, currency)}
            detail={`${fmtCount(pipeline.completed)} completada(s)`}
          />
          {pipeline.stuck > 0 && (
            <MetricLine
              label={`Atascadas (> ${pipeline.stuckAfterMinutes} min)`}
              value={fmtCount(pipeline.stuck)}
              tone="critical"
            />
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function MetricLine({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "success" | "critical";
}) {
  return (
    <InlineStack align="space-between" blockAlign="start">
      <BlockStack gap="0">
        <Text variant="bodySm" as="span">
          {label}
        </Text>
        {detail && (
          <Text variant="bodySm" as="span" tone="subdued">
            {detail}
          </Text>
        )}
      </BlockStack>
      <Text variant="bodySm" as="span" tone={tone}>
        {value}
      </Text>
    </InlineStack>
  );
}
