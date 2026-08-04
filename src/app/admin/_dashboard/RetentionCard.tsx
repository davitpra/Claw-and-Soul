"use client";

import { BlockStack, Card, Divider, InlineStack, Text } from "@shopify/polaris";
import type { UserRetention } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { BarMeter } from "./BarMeter";
import { StatLine } from "./StatLine";
import { fmtCount, fmtPct } from "./format";

/**
 * Cuánto del negocio viene de gente que vuelve.
 *
 * Las dos mitades de la card tienen alcances distintos y lo declaran: la
 * recompra es acumulada —con una ventana de 3 días nadie recompra— y el reparto
 * de ingresos es del periodo.
 */
export function RetentionCard({
  retention,
  currency,
  periodLabel,
}: {
  retention: UserRetention;
  currency: string;
  periodLabel: string;
}) {
  // Los invitados van en su propio tramo, visibles: si se ocultaran, la suma de
  // los otros dos no cuadraría con el KPI de ingresos y parecería un error de
  // cálculo en vez de una compra sin cuenta.
  const segments = [
    {
      label: "Clientes que repiten",
      value: retention.revenueReturning,
      orders: retention.ordersReturning,
    },
    {
      label: "Primera compra",
      value: retention.revenueFirstTime,
      orders: retention.ordersFirstTime,
    },
    {
      label: "Invitados (sin cuenta)",
      value: retention.revenueGuest,
      orders: retention.ordersGuest,
    },
  ];

  const peak = Math.max(...segments.map((s) => s.value), 1);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text variant="headingSm" as="h3">
              Retención y recompra
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              Ingresos de los últimos {periodLabel}
            </Text>
          </BlockStack>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtPct(retention.returningRevenuePct)}
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              de recurrentes
            </Text>
          </InlineStack>
        </InlineStack>

        <BlockStack gap="300">
          {segments.map((segment) => (
            <BlockStack gap="100" key={segment.label}>
              <InlineStack align="space-between">
                <Text variant="bodySm" as="span">
                  {segment.label}
                </Text>
                <Text variant="bodySm" as="span">
                  {fmtCurrency(segment.value, currency)}
                </Text>
              </InlineStack>
              <BarMeter value={segment.value} peak={peak} />
              <Text variant="bodySm" as="span" tone="subdued">
                {fmtCount(segment.orders)} pedido(s)
              </Text>
            </BlockStack>
          ))}
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Compradores con más de un pedido"
            detail="Acumulado histórico, no del periodo: en una ventana corta nadie llega a repetir"
            value={`${fmtCount(retention.repeatBuyers)} de ${fmtCount(retention.buyers)}`}
          />
          <StatLine
            label="Tasa de recompra"
            detail="Solo cuenta pedidos enlazados a una cuenta"
            value={fmtPct(retention.repeatRatePct)}
          />
        </BlockStack>

        {retention.unconvertedCurrencies.length > 0 && (
          <Text variant="bodySm" as="p" tone="subdued">
            Importes aproximados: sin tipo de cambio para{" "}
            {retention.unconvertedCurrencies.join(", ")}.
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}
