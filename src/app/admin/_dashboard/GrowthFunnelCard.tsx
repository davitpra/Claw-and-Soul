"use client";

import { BlockStack, Card, InlineStack, Text } from "@shopify/polaris";
import { OverviewGrowth } from "@/entities/admin/api";
import { StatLine } from "./StatLine";
import { deltaTone, fmtCount, fmtDelta, fmtPct } from "./format";

/**
 * Volumen del periodo: altas y las dos cifras sueltas que miden la ventana
 * entera, no a un usuario concreto.
 *
 * El embudo que vivía aquí se lo llevó `ActivationCohortCard`. Contaba hechos
 * ocurridos dentro de la ventana sin perseguir al mismo usuario, así que puesto
 * al lado de una cohorte real habría dado dos cifras distintas para la misma
 * pregunta y se habría leído como un error de cálculo.
 */
export function GrowthFunnelCard({
  growth,
  periodLabel,
}: {
  growth: OverviewGrowth;
  periodLabel: string;
}) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text variant="headingSm" as="h3">
              Volumen del periodo
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              Altas y hechos de los últimos {periodLabel}
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

        {/*
          Las cuatro líneas están acotadas al periodo pero no cuentan lo mismo:
          dos son volumen bruto, una es una razón y la última data el momento en
          que cada carrito se dio por perdido. Cada una lo declara en su detalle.
        */}
        <BlockStack gap="150">
          <StatLine
            label="Generaciones completadas"
            detail="Sin las pruebas del equipo"
            value={fmtCount(growth.funnel.generations)}
          />
          <StatLine
            label="Pedidos pagados"
            detail="Incluye los de invitado, que no se atribuyen a ninguna cuenta"
            value={fmtCount(growth.funnel.ordersPaid)}
          />
          <StatLine
            label="Conversión generación → pedido"
            detail="Pedidos pagados ÷ generaciones del periodo"
            value={fmtPct(growth.conversionRate)}
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
