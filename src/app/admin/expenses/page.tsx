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
  TextField,
  Button,
  Box,
  Divider,
} from "@shopify/polaris";
import { adminApi, ExpensesSummary, ProviderRate } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";

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
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingSummary(true);
    setSummaryError(null);
    adminApi.expenses
      .summary(period)
      .then((data) => {
        if (alive) {
          setSummary(data);
          setLoadingSummary(false);
        }
      })
      .catch((e: Error) => {
        if (alive) {
          setSummaryError(e.message);
          setLoadingSummary(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [period]);

  // --- Tarifas fal.ai ---
  const [rates, setRates] = useState<ProviderRate[]>([]);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});
  const [rateSaving, setRateSaving] = useState<Record<string, boolean>>({});
  const [rateMsg, setRateMsg] = useState<Record<string, { text: string; tone: "success" | "critical" }>>({});

  useEffect(() => {
    let alive = true;
    adminApi.expenseRates.list().then((data) => {
      if (alive) {
        setRates(data);
        const inputs: Record<string, string> = {};
        for (const r of data) inputs[r.id] = String(r.amount);
        setRateInputs(inputs);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  async function handleSaveRate(rate: ProviderRate) {
    const amount = parseFloat(rateInputs[rate.id] ?? "");
    if (isNaN(amount) || amount < 0) {
      setRateMsg((prev) => ({ ...prev, [rate.id]: { text: "Monto inválido.", tone: "critical" } }));
      return;
    }
    setRateSaving((prev) => ({ ...prev, [rate.id]: true }));
    setRateMsg((prev) => { const next = { ...prev }; delete next[rate.id]; return next; });
    try {
      const updated = await adminApi.expenseRates.update(rate.id, { amount });
      setRates((prev) => prev.map((r) => (r.id === rate.id ? updated : r)));
      setRateInputs((prev) => ({ ...prev, [rate.id]: String(updated.amount) }));
      setRateMsg((prev) => ({ ...prev, [rate.id]: { text: "Guardado.", tone: "success" } }));
    } catch (e) {
      setRateMsg((prev) => ({ ...prev, [rate.id]: { text: (e as Error).message, tone: "critical" } }));
    } finally {
      setRateSaving((prev) => ({ ...prev, [rate.id]: false }));
    }
  }

  // --- Tasa Pictorem ---
  const [fxRate, setFxRate] = useState<{ rate: number; source: string } | null>(null);
  const [fxInput, setFxInput] = useState("");
  const [fxSaving, setFxSaving] = useState(false);
  const [fxMsg, setFxMsg] = useState<{ text: string; tone: "success" | "critical" } | null>(null);

  useEffect(() => {
    let alive = true;
    adminApi.orders.podFxRate().then((res) => {
      if (alive) {
        setFxRate(res);
        setFxInput(String(res.rate));
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  async function handleSaveFxRate() {
    const rate = parseFloat(fxInput);
    if (isNaN(rate) || rate <= 0) {
      setFxMsg({ text: "Ingresa una tasa válida (> 0).", tone: "critical" });
      return;
    }
    setFxSaving(true);
    setFxMsg(null);
    try {
      const res = await adminApi.orders.podSetFxRate(rate);
      setFxRate({ rate: res.rate, source: "db" });
      setFxInput(String(res.rate));
      setFxMsg({ text: "Tasa actualizada.", tone: "success" });
    } catch (e) {
      setFxMsg({ text: (e as Error).message, tone: "critical" });
    } finally {
      setFxSaving(false);
    }
  }

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

        {/* Tarifas fal.ai */}
        <Card>
          <BlockStack gap="300">
            <BlockStack gap="100">
              <Text variant="headingSm" as="h2">
                Tarifas fal.ai
              </Text>
              <Text as="p" tone="subdued" variant="bodySm">
                Costo por operación usado para registrar gastos de generación y upscale. Los cambios aplican a nuevas operaciones.
              </Text>
            </BlockStack>

            {rates.length === 0 ? (
              <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando tarifas…
                </Text>
              </InlineStack>
            ) : (
              <BlockStack gap="300">
                {rates.map((rate) => (
                  <BlockStack key={rate.id} gap="150">
                    <BlockStack gap="050">
                      <Text as="span" fontWeight="semibold" variant="bodySm">
                        {rate.model}
                      </Text>
                      <Text as="span" tone="subdued" variant="bodySm">
                        {rate.unit === "per_image" ? "por imagen" : "por megapíxel"} · {rate.currency}
                      </Text>
                    </BlockStack>
                    {rateMsg[rate.id] && (
                      <Banner
                        tone={rateMsg[rate.id].tone}
                        onDismiss={() => setRateMsg((prev) => { const next = { ...prev }; delete next[rate.id]; return next; })}
                      >
                        {rateMsg[rate.id].text}
                      </Banner>
                    )}
                    <InlineStack gap="200" blockAlign="end">
                      <div style={{ width: 160 }}>
                        <TextField
                          label="Monto"
                          labelHidden
                          type="number"
                          step={0.000001}
                          value={rateInputs[rate.id] ?? ""}
                          onChange={(v) => setRateInputs((prev) => ({ ...prev, [rate.id]: v }))}
                          autoComplete="off"
                          prefix="$"
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="slim"
                        loading={rateSaving[rate.id]}
                        disabled={
                          rateInputs[rate.id] === String(rate.amount)
                        }
                        onClick={() => handleSaveRate(rate)}
                      >
                        Guardar
                      </Button>
                    </InlineStack>
                  </BlockStack>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>

        {/* Tasa Pictorem */}
        <Card>
          <BlockStack gap="300">
            <BlockStack gap="100">
              <Text variant="headingSm" as="h2">
                Tasa de cambio Pictorem (USD → CAD)
              </Text>
              <Text as="p" tone="subdued" variant="bodySm">
                Pictorem factura en CAD a una tasa interna fija. Los precios de{" "}
                <code>getprice</code> (USD) se convierten con esta tasa para coincidir con la
                factura real. Recalíbrala desde cualquier factura:{" "}
                <Text as="span" fontWeight="semibold">
                  tasa = total&nbsp;CAD / total&nbsp;USD
                </Text>
                .
              </Text>
            </BlockStack>
            {fxMsg && (
              <Banner
                tone={fxMsg.tone}
                onDismiss={() => setFxMsg(null)}
              >
                {fxMsg.text}
              </Banner>
            )}
            <InlineStack gap="200" blockAlign="end">
              <div style={{ width: 160 }}>
                <TextField
                  label="Tasa USD → CAD"
                  type="number"
                  step={0.0001}
                  value={fxInput}
                  onChange={setFxInput}
                  autoComplete="off"
                  disabled={fxRate === null}
                />
              </div>
              <Button
                variant="primary"
                loading={fxSaving}
                disabled={
                  fxRate === null ||
                  fxInput === "" ||
                  fxInput === String(fxRate?.rate)
                }
                onClick={handleSaveFxRate}
              >
                Guardar
              </Button>
              {fxRate && (
                <Box paddingBlockEnd="100">
                  <Text as="span" tone="subdued" variant="bodySm">
                    Fuente:{" "}
                    {fxRate.source === "db"
                      ? "configurada"
                      : fxRate.source === "env"
                        ? "variable de entorno"
                        : "por defecto"}
                  </Text>
                </Box>
              )}
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
