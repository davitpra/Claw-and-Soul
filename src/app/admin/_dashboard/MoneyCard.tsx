"use client";

import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewMoney } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { StatLine } from "./StatLine";
import { fmtCount, fmtPct } from "./format";

/**
 * Desglose de a dónde va el dinero: costos por categoría y su resta contra los
 * ingresos del periodo.
 *
 * La economía de créditos (circulación, emisión, pasivo) vive en `CreditsCard`;
 * aquí solo entra el dinero ya movido.
 */
export function MoneyCard({
  money,
  currency,
}: {
  money: OverviewMoney;
  currency: string;
}) {
  const categories = Object.entries(money.costs.byCategory)
    .filter(([, row]) => row.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Detalle de Costos
          </Text>
          <Text variant="bodySm" as="span" tone="subdued">
            {fmtCount(money.costs.count)} movimiento(s)
          </Text>
        </InlineStack>

        {categories.length === 0 ? (
          <Text as="p" tone="subdued">
            Sin gastos registrados en este periodo.
          </Text>
        ) : (
          <BlockStack gap="300">
            {categories.map(([category, { total }]) => {
              const share = money.costs.total ? total / money.costs.total : 0;
              return (
                <BlockStack gap="100" key={category}>
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="span">
                      {EXPENSE_CATEGORY_LABELS[category] ?? category}
                    </Text>
                    <Text variant="bodySm" as="span">
                      {fmtCurrency(total, currency)}
                    </Text>
                  </InlineStack>
                  {/* Barra de reparto: `Box` de Polaris, sin Tailwind. */}
                  <Box
                    background="bg-surface-secondary"
                    borderRadius="100"
                    minHeight="6px"
                  >
                    <Box
                      background="bg-fill-brand"
                      borderRadius="100"
                      minHeight="6px"
                      width={`${Math.max(share * 100, 2)}%`}
                    />
                  </Box>
                </BlockStack>
              );
            })}
          </BlockStack>
        )}

        <Divider />

        <BlockStack gap="150">
          <Text variant="headingSm" as="h3">
            Detalle de Ingresos y Costos
          </Text>
          <StatLine
            label="Ingresos"
            value={`≈ ${fmtCurrency(money.revenue, currency)}`}
          />
          <StatLine
            label="Costos"
            value={`− ${fmtCurrency(money.costs.total, currency)}`}
          />
          <StatLine
            label="Margen bruto"
            value={`≈ ${fmtCurrency(money.grossMargin, currency)}`}
            detail={fmtPct(money.grossMarginPct)}
            strong
            tone={money.grossMargin >= 0 ? undefined : "critical"}
          />
        </BlockStack>

        <Divider />

        {/* Fuera del bloque anterior a propósito: ahí se lee ingresos − costos =
            margen, y meter el ticket medio en medio rompe esa aritmética. */}
        <StatLine
          label="Ticket medio"
          detail="Ingresos ÷ pedidos pagados"
          strong
          value={
            money.aov === null ? "—" : `≈ ${fmtCurrency(money.aov, currency)}`
          }
        />

        {money.unconvertedCurrencies.length > 0 && (
          <Text variant="bodySm" as="p" tone="caution">
            Sin tipo de cambio para {money.unconvertedCurrencies.join(", ")}: su
            importe se suma sin convertir.
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}
