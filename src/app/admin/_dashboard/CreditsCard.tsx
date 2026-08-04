"use client";

import {
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewMoney, StatsPeriod } from "@/entities/admin/api";
import { fmtCreditCost, fmtUnitCost } from "@/entities/admin/lib/credit-format";
import { StatLine } from "./StatLine";
import { fmtCount } from "./format";

/**
 * Economía de créditos. Acompaña a `PipelineHealthCard` porque el crédito es la
 * unidad con la que se paga una generación: el gasto de aquí es el volumen de
 * allí visto desde el saldo del usuario.
 *
 * Ojo con el alcance temporal, que no es uniforme: «en circulación» es un
 * acumulado —una foto del ahora— mientras que emitidos y gastados siguen el
 * selector de periodo. Por eso solo estos últimos llevan el periodo en la
 * etiqueta.
 *
 * El pasivo se valora al costo medio de una generación, no a precio de venta: un
 * crédito solo cuesta lo que cuesta producirlo.
 */
export function CreditsCard({
  money,
  currency,
  period,
  periodLabel,
}: {
  money: OverviewMoney;
  currency: string;
  period: StatsPeriod;
  periodLabel: string;
}) {
  const breakdown = money.unitCostBreakdown;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Créditos
          </Text>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtCount(money.creditsSpentNet)}
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              gastados
            </Text>
          </InlineStack>
        </InlineStack>

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label={`Créditos emitidos (${periodLabel})`}
            value={fmtCount(money.creditsIssued)}
          />
          <StatLine
            label="Créditos en circulación"
            detail="Saldo actual de todas las cuentas, no del periodo"
            value={fmtCount(money.creditsOutstanding)}
          />
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Costo medio por crédito"
            // Mismo número que «Costo medio por generación» en
            // `PipelineHealthCard`: allí se lee por unidad producida, aquí por
            // unidad de saldo. El desglose vision/imagen solo se explica aquí.
            detail={
              breakdown
                ? `visión ${fmtUnitCost(
                    breakdown.vision,
                    currency,
                  )} · imagen ${fmtUnitCost(breakdown.image, currency)}`
                : undefined
            }
            // `fmtUnitCost`, no `fmtCurrency`: estas tarifas viven por debajo
            // del céntimo y a dos decimales se leerían «0,00 $».
            value={fmtUnitCost(money.unitCost, currency)}
          />
          <StatLine
            label="Pasivo total"
            value={
              money.unitCost === null
                ? "—"
                : `≈ ${fmtCreditCost(money.creditLiability, currency)}`
            }
            strong
            projected
          />
        </BlockStack>

        <Text variant="bodySm" as="p" tone="subdued">
          {money.unitCost === null
            ? "Aún no hay generaciones con costo registrado, así que el pasivo no se puede estimar."
            : money.unitCostPeriod !== period
              ? `Sin generaciones con costo en el periodo: el costo medio se calculó sobre todo el histórico (${fmtCount(
                  money.unitCostSampleSize,
                )} generaciones).`
              : `Media de ${fmtCount(
                  money.unitCostSampleSize,
                )} generaciones con costo registrado.`}
        </Text>
      </BlockStack>
    </Card>
  );
}
