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
    { label: "Mascotas ingresadas", value: growth.funnel.pets },
    { label: "Generaciones completadas", value: growth.funnel.generations },
    { label: "PBN guardados", value: growth.funnel.pbnSaved },
    { label: "Pedidos derivados", value: growth.funnel.ordersPaid },
  ];

  const peak = Math.max(...steps.map((s) => s.value), 1);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text variant="headingSm" as="h3">
              Crecimiento
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              Cuentas creadas y hechos ocurridos en los últimos {periodLabel}
            </Text>
          </BlockStack>
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

        {/*
          Las tres líneas están acotadas al periodo, pero no cuentan lo mismo: una
          es una razón, otra mira la base ya existente y la última data el momento
          en que cada carrito se dio por perdido. Cada una lo declara en su
          detalle; sin eso, un 0 de altas arriba y un 1 de activos aquí se leen
          como una contradicción.
        */}
        <BlockStack gap="150">
          <StatLine
            label="Conversión generación → pedido"
            detail="Pedidos pagados ÷ generaciones del periodo"
            value={fmtPct(growth.conversionRate)}
          />
          <StatLine
            label="Usuarios activos"
            detail={`Cuentas ya existentes que iniciaron sesión en los últimos ${periodLabel}`}
            value={fmtCount(growth.activeUsers)}
          />
          <StatLine
            label="Carritos abandonados"
            detail={`Cumplieron ${growth.abandonedAfterDays} días sin actividad durante los últimos ${periodLabel}`}
            value={fmtCount(growth.abandonedCarts)}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
