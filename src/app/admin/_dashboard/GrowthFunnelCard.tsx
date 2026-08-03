"use client";

import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewGrowth } from "@/entities/admin/api";
import { StatLine } from "./StatLine";
import { deltaTone, fmtCount, fmtDelta, fmtPct } from "./format";

/**
 * Embudo del periodo. Cuenta hechos ocurridos DENTRO de la ventana, no cohortes:
 * no persigue al mismo usuario de un escalón al siguiente, así que sirve para
 * ver la forma del volumen, no para atribuir conversión individual.
 */
export function GrowthFunnelCard({
  growth,
  periodLabel,
}: {
  growth: OverviewGrowth;
  periodLabel: string;
}) {
  const steps = [
    { label: "Mascotas creadas", value: growth.funnel.pets },
    { label: "Generaciones completadas", value: growth.funnel.generations },
    { label: "PBN guardados", value: growth.funnel.pbnSaved },
    { label: "Pedidos pagados", value: growth.funnel.ordersPaid },
  ];

  const peak = Math.max(...steps.map((s) => s.value), 1);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Crecimiento
          </Text>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtCount(growth.newUsers)}
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              altas
            </Text>
            {fmtDelta(growth.newUsersDeltaPct) && (
              <Text
                variant="bodySm"
                as="span"
                tone={deltaTone(growth.newUsersDeltaPct)}
              >
                {fmtDelta(growth.newUsersDeltaPct)}
              </Text>
            )}
          </InlineStack>
        </InlineStack>

        <BlockStack gap="300">
          {steps.map((step) => (
            <BlockStack gap="100" key={step.label}>
              <InlineStack align="space-between">
                <Text variant="bodySm" as="span">
                  {step.label}
                </Text>
                <Text variant="bodySm" as="span">
                  {fmtCount(step.value)}
                </Text>
              </InlineStack>
              <Box
                background="bg-surface-secondary"
                borderRadius="100"
                minHeight="6px"
              >
                <Box
                  background="bg-fill-brand"
                  borderRadius="100"
                  minHeight="6px"
                  width={`${Math.max((step.value / peak) * 100, step.value ? 2 : 0)}%`}
                />
              </Box>
            </BlockStack>
          ))}
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Conversión generación → pedido"
            value={fmtPct(growth.conversionRate)}
          />
          <StatLine
            label={`Usuarios activos (${periodLabel})`}
            value={fmtCount(growth.activeUsers)}
          />
          <StatLine
            label={`Carritos abandonados (> ${growth.abandonedAfterDays} días)`}
            value={fmtCount(growth.abandonedCarts)}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
