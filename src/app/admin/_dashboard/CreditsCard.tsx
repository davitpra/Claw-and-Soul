"use client";

import {
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewGrowth, OverviewMoney, StatsPeriod } from "@/entities/admin/api";
import { fmtCreditCost, fmtUnitCost } from "@/entities/admin/lib/credit-format";
import { StatLine } from "./StatLine";
import { deltaTone, fmtCount, fmtDelta } from "./format";

/**
 * Base de usuarios y economía de créditos.
 *
 * Ojo con el alcance temporal, que no es uniforme: «registrados» y «en
 * circulación» son acumulados —una foto del ahora— mientras que altas, emitidos
 * y gastados sí siguen el selector de periodo. Por eso solo estos últimos llevan
 * el periodo en la etiqueta.
 *
 * El pasivo se valora al costo medio de una generación, no a precio de venta: un
 * crédito solo cuesta lo que cuesta producirlo.
 */
export function CreditsCard({
  growth,
  money,
  currency,
  period,
  periodLabel,
}: {
  growth: OverviewGrowth;
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
            Usuarios y créditos
          </Text>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtCount(growth.totalUsers)}
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              registrados
            </Text>
          </InlineStack>
        </InlineStack>

        <StatLine
          label={`Altas (${periodLabel})`}
          value={fmtCount(growth.newUsers)}
          delta={fmtDelta(growth.newUsersDeltaPct)}
          deltaTone={deltaTone(growth.newUsersDeltaPct)}
        />

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Créditos en circulación"
            detail="Saldo actual de todas las cuentas, no del periodo"
            value={fmtCount(money.creditsOutstanding)}
          />
          <StatLine
            label={`Créditos emitidos (${periodLabel})`}
            value={fmtCount(money.creditsIssued)}
          />
          <StatLine
            label={`Créditos gastados (${periodLabel})`}
            value={fmtCount(money.creditsSpentNet)}
          />
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <StatLine
            label="Costo medio por crédito"
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
