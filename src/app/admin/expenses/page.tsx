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
import {
  adminApi,
  AdminCreditEconomics,
  ExpensesSummary,
} from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import {
  fmtCreditCost,
  fmtUnitCost,
} from "@/entities/admin/lib/credit-format";

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

  // --- Economía de créditos: mismo período, un solo Select gobierna ambas ---
  const [economics, setEconomics] = useState<AdminCreditEconomics | null>(null);
  const [economicsError, setEconomicsError] = useState<string | null>(null);
  const [loadedEconomicsPeriod, setLoadedEconomicsPeriod] = useState<
    string | null
  >(null);
  const loadingEconomics = loadedEconomicsPeriod !== period;

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

  useEffect(() => {
    let alive = true;
    adminApi.credits
      .economics(period)
      .then((data) => {
        if (alive) {
          setEconomics(data);
          setEconomicsError(null);
        }
      })
      .catch((e: Error) => {
        if (alive) setEconomicsError(e.message);
      })
      .finally(() => {
        if (alive) setLoadedEconomicsPeriod(period);
      });
    return () => {
      alive = false;
    };
  }, [period]);

  return (
    <Page title="Gastos" subtitle="Resumen de costos">
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

        {/* Economía de créditos: el puente entre el ledger y el gasto real */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingSm" as="h2">
              Economía de créditos
            </Text>

            {economicsError && (
              <Banner
                tone="critical"
                onDismiss={() => setEconomicsError(null)}
              >
                {economicsError}
              </Banner>
            )}

            {loadingEconomics ? (
              <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando…
                </Text>
              </InlineStack>
            ) : economics ? (
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span">Créditos emitidos</Text>
                  <Text as="span" fontWeight="semibold">
                    {economics.creditsIssued.toLocaleString("es-ES")}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">Créditos gastados</Text>
                  <Text as="span" fontWeight="semibold">
                    {economics.creditsSpentNet.toLocaleString("es-ES")}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <BlockStack gap="050">
                    <Text as="span">En circulación</Text>
                    <Text as="span" tone="subdued" variant="bodySm">
                      Saldo actual de todas las cuentas, no del período
                    </Text>
                  </BlockStack>
                  <Text as="span" fontWeight="semibold">
                    {economics.creditsOutstanding.toLocaleString("es-ES")}
                  </Text>
                </InlineStack>

                <Divider />

                <InlineStack align="space-between">
                  <BlockStack gap="050">
                    <Text as="span">Costo medio por crédito</Text>
                    {economics.unitCostBreakdown && (
                      <Text as="span" tone="subdued" variant="bodySm">
                        vision{" "}
                        {fmtUnitCost(
                          economics.unitCostBreakdown.vision,
                          economics.baseCurrency,
                        )}{" "}
                        · imagen{" "}
                        {fmtUnitCost(
                          economics.unitCostBreakdown.image,
                          economics.baseCurrency,
                        )}
                      </Text>
                    )}
                  </BlockStack>
                  <Text as="span" fontWeight="semibold">
                    {fmtUnitCost(economics.unitCost, economics.baseCurrency)}
                  </Text>
                </InlineStack>

                <InlineStack align="space-between">
                  <Text as="span" fontWeight="semibold">
                    Pasivo total
                  </Text>
                  <Text as="span" fontWeight="semibold">
                    {fmtCreditCost(
                      economics.unitCost === null
                        ? null
                        : economics.outstandingLiability,
                      economics.baseCurrency,
                    )}
                  </Text>
                </InlineStack>

                {economics.unitCost === null ? (
                  <Text as="p" tone="subdued" variant="bodySm">
                    Aún no hay generaciones con costo registrado, así que el
                    pasivo no se puede estimar.
                  </Text>
                ) : (
                  <Text as="p" tone="subdued" variant="bodySm">
                    {economics.unitCostPeriod !== economics.period
                      ? `Sin generaciones con costo en el período: el costo medio se calculó sobre todo el histórico (${economics.unitCostSampleSize.toLocaleString("es-ES")} generaciones).`
                      : `Media de ${economics.unitCostSampleSize.toLocaleString("es-ES")} generaciones con costo registrado.`}
                  </Text>
                )}
              </BlockStack>
            ) : null}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
