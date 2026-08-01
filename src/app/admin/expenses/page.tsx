"use client";

import { useState, useEffect } from "react";
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Select,
  Spinner,
  Banner,
  Divider,
} from "@shopify/polaris";
import { adminApi, ExpensesSummary } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { RatesSection } from "./_components/RatesSection";

function fmtCurrency(amount: number, currency = "CAD") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

const PERIOD_OPTIONS = [
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Últimos 90 días", value: "90d" },
  { label: "Todo el tiempo", value: "all" },
];

export default function AdminExpensesPage() {
  // --- Resumen global ---
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // `loadingSummary` derivado: hay carga en curso mientras el período ya
  // resuelto no coincida con el actual. Evita el setState síncrono en el efecto.
  const [loadedPeriod, setLoadedPeriod] = useState<string | null>(null);
  const loadingSummary = loadedPeriod !== period;

  useEffect(() => {
    let alive = true;
    adminApi.expenses
      .summary(period)
      .then((data) => {
        if (alive) {
          setSummary(data);
          setSummaryError(null);
        }
      })
      .catch((e: Error) => {
        if (alive) setSummaryError(e.message);
      })
      .finally(() => {
        if (alive) setLoadedPeriod(period);
      });
    return () => {
      alive = false;
    };
  }, [period]);

  return (
    <Page title="Gastos" subtitle="Resumen de costos y configuración de tarifas">
      <BlockStack gap="400">
        {/* Resumen global */}
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingSm" as="h2">
                Resumen de gastos
              </Text>
              <div style={{ width: 180 }}>
                <Select
                  label="Período"
                  labelHidden
                  options={PERIOD_OPTIONS}
                  value={period}
                  onChange={(v) => setPeriod(v as typeof period)}
                />
              </div>
            </InlineStack>

            {summaryError && (
              <Banner tone="critical" onDismiss={() => setSummaryError(null)}>
                {summaryError}
              </Banner>
            )}

            {loadingSummary ? (
              <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando…
                </Text>
              </InlineStack>
            ) : summary ? (
              <BlockStack gap="200">
                {Object.entries(summary.byCategory).map(([cat, data]) => (
                  <InlineStack key={cat} align="space-between">
                    <Text as="span">
                      {EXPENSE_CATEGORY_LABELS[cat] ?? cat}
                    </Text>
                    <InlineStack gap="400">
                      <Text as="span" tone="subdued" variant="bodySm">
                        {data.count} registro(s)
                      </Text>
                      <Text as="span" fontWeight="semibold">
                        {fmtCurrency(data.total, summary.baseCurrency)}
                      </Text>
                    </InlineStack>
                  </InlineStack>
                ))}
                {Object.keys(summary.byCategory).length > 0 && (
                  <Divider />
                )}
                <InlineStack align="space-between">
                  <Text as="span" fontWeight="semibold">
                    Total
                  </Text>
                  <Text as="span" fontWeight="semibold">
                    {fmtCurrency(summary.grandTotal, summary.baseCurrency)}
                  </Text>
                </InlineStack>
                {Object.keys(summary.byCategory).length === 0 && (
                  <Text as="p" tone="subdued">
                    No hay gastos registrados en este período.
                  </Text>
                )}
              </BlockStack>
            ) : null}
          </BlockStack>
        </Card>

        <RatesSection />
      </BlockStack>
    </Page>
  );
}
