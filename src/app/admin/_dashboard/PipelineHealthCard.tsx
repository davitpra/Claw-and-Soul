"use client";

import { BlockStack, Card, Divider, InlineStack, Text } from "@shopify/polaris";
import {
  OverviewMoney,
  OverviewPipeline,
  StatsPeriod,
} from "@/entities/admin/api";
import { fmtUnitCost } from "@/entities/admin/lib/credit-format";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { deltaTone, fmtCount, fmtDelta, fmtDuration, fmtPct } from "./format";

/**
 * Salud del pipeline de IA. Todas las cifras excluyen las generaciones de
 * prueba del admin (`isAdminTest`), que antes inflaban la tasa de fallo.
 *
 * El reparto por estado se resuelve con dos renglones —completadas y fallidas,
 * con su peso sobre el total— en vez de con una dona aparte: son los dos únicos
 * estados terminales, y una dona de dos porciones no dice más que sus cifras.
 *
 * La evolución diaria de generaciones no vive aquí: `TimelineCard` ya la ofrece
 * en su selector de métrica.
 *
 * El bloque de costo sale de `money`, no de `pipeline`: es exactamente la misma
 * cifra que muestra `CreditsCard` al lado. Antes el backend calculaba aquí una
 * media propia —con upscales dentro y otro denominador— y las dos cards se
 * contradecían en pantalla. El upscale sigue visible, pero como lo que es: un
 * gasto de preparación para impresión, aparte del costo de generar.
 */
export function PipelineHealthCard({
  pipeline,
  money,
  currency,
  period,
}: {
  pipeline: OverviewPipeline;
  money: OverviewMoney;
  currency: string;
  period: StatsPeriod;
}) {
  const upscale = money.costs.byCategory.image_upscale;
  const generationSpend = money.costs.byCategory.image_generation?.total ?? 0;
  const aiSpend = generationSpend + (upscale?.total ?? 0);
  // Subir la tasa de fallo es malo: el delta va invertido respecto al resto.
  const failureDelta =
    pipeline.failureRate !== null && pipeline.failureRatePrev !== null
      ? pipeline.failureRate - pipeline.failureRatePrev
      : null;

  const share = (value: number) =>
    pipeline.total ? (value / pipeline.total) * 100 : null;

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
            label="Completadas"
            value={fmtCount(pipeline.completed)}
            detail={`${fmtPct(share(pipeline.completed))} del total`}
          />
          <MetricLine
            label="Fallidas"
            value={fmtCount(pipeline.failed)}
            // La tasa de fallo va aquí de detalle: es la misma cifra que el peso
            // de este renglón, así que repetirla en una línea propia sobraba.
            detail={
              failureDelta === null
                ? `${fmtPct(pipeline.failureRate)} del total`
                : `${fmtPct(pipeline.failureRate)} del total · ${fmtDelta(
                    failureDelta,
                  )} vs. periodo anterior`
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
          {pipeline.stuck > 0 && (
            <MetricLine
              label={`Atascadas (> ${pipeline.stuckAfterMinutes} min)`}
              value={fmtCount(pipeline.stuck)}
              tone="critical"
            />
          )}
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <MetricLine
            label="Costo medio por generación"
            // Se nombra la coincidencia en vez de dejarla adivinar: es el mismo
            // número que «Costo medio por crédito» de la card de al lado, porque
            // un crédito se gasta en exactamente una generación.
            detail={
              money.unitCost === null
                ? "Sin generaciones con costo registrado"
                : money.unitCostPeriod !== period
                  ? `= costo por crédito · media del histórico (${fmtCount(
                      money.unitCostSampleSize,
                    )} generaciones)`
                  : `= costo por crédito · media de ${fmtCount(
                      money.unitCostSampleSize,
                    )} generaciones`
            }
            value={fmtUnitCost(money.unitCost, currency)}
          />
          <MetricLine
            label="Upscales de impresión"
            // No entra en la media de arriba: un upscale prepara un archivo para
            // imprimir, no genera arte, y no consume crédito.
            detail={
              upscale?.count
                ? `${fmtUnitCost(
                    upscale.total / upscale.count,
                    currency,
                  )} cada uno · aparte del costo por generación`
                : "Aparte del costo por generación"
            }
            value={`${fmtCount(upscale?.count ?? 0)} · ${fmtCurrency(
              upscale?.total ?? 0,
              currency,
            )}`}
          />
          <MetricLine
            label="Gasto de IA en el periodo"
            detail="Generación + upscale"
            value={fmtCurrency(aiSpend, currency)}
          />
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
