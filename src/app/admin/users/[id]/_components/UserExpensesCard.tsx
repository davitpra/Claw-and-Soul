"use client";

import { useState } from "react";
import {
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import {
  AdminUserCreditEconomics,
  AdminUserRevenue,
  CustomerExpenses,
} from "@/entities/admin/api";
import { fmtCreditCost } from "@/entities/admin/lib/credit-format";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { RatesModal } from "./RatesModal";

interface UserExpensesCardProps {
  /** Lo facturado por el cliente: solo pedidos pagados. */
  revenue: AdminUserRevenue | null;
  loadingRevenue: boolean;
  expenses: CustomerExpenses | null;
  loading: boolean;
  /** Los créditos del cliente traducidos a dinero, por el lado del costo. */
  economics: AdminUserCreditEconomics | null;
  loadingEconomics: boolean;
}

/**
 * El balance del cliente en tres cifras: lo que ha pagado, lo que ha costado
 * servirle y la diferencia. Los importes vienen convertidos a la moneda base del
 * backend, de ahí el "≈".
 *
 * El costo de sus generaciones ya está dentro de los gastos (cada generación
 * completada deja un `Expense`), así que la ganancia no vuelve a restarlo: los
 * créditos solo aparecen como nota del costo que aún está por incurrir.
 */
export function UserExpensesCard({
  revenue,
  loadingRevenue,
  expenses,
  loading,
  economics,
  loadingEconomics,
}: UserExpensesCardProps) {
  const [ratesOpen, setRatesOpen] = useState(false);

  const loadingBalance = loadingRevenue || loading;
  // Todas vienen de la misma moneda base del backend; se toma la primera que haya.
  const currency =
    revenue?.baseCurrency ?? expenses?.baseCurrency ?? economics?.baseCurrency;

  const income = revenue?.total ?? 0;
  const cost = expenses?.grandTotal ?? 0;
  const profit = income - cost;

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Balance del cliente
        </Text>

        {loadingBalance && <Spinner size="small" />}

        {!loadingBalance && !revenue && !expenses && (
          <Text as="p" tone="subdued">
            Sin datos de facturación ni de gastos.
          </Text>
        )}

        {!loadingBalance && (revenue || expenses) && currency && (
          <BlockStack gap="300">
            <BlockStack gap="200">
              <SummaryRow
                label="Ingresos"
                value={`≈ ${fmtCurrency(income, currency)}`}
              />
              <Text as="p" tone="subdued" variant="bodySm">
                {revenue && revenue.orderCount > 0
                  ? `${revenue.orderCount.toLocaleString("es-ES")} pedido(s) pagado(s)`
                  : "Sin pedidos pagados aún"}
              </Text>

              <SummaryRow
                label="Gastos"
                value={`≈ ${fmtCurrency(cost, currency)}`}
              />
              {/* El desglose por categoría vive en la pestaña "Gastos": aquí
                  solo interesa el total que resta de la ganancia. */}
              <Text as="p" tone="subdued" variant="bodySm">
                {expenses && expenses.count > 0
                  ? `${expenses.count.toLocaleString("es-ES")} gasto(s) registrado(s)`
                  : "Sin gastos registrados aún"}
              </Text>
            </BlockStack>

            <Divider />

            <SummaryRow
              label="Ganancia"
              value={`≈ ${fmtCurrency(profit, currency)}`}
              tone={profit >= 0 ? "success" : "critical"}
              strong
            />

            {/* Un total al que le falta el cambio de alguna divisa sigue siendo
                útil, pero no puede presentarse como exacto. */}
            {revenue && revenue.unconvertedCurrencies.length > 0 && (
              <Text as="p" tone="subdued" variant="bodySm">
                {`Incluye importes en ${revenue.unconvertedCurrencies.join(", ")} sin convertir: no se pudo obtener el tipo de cambio.`}
              </Text>
            )}
          </BlockStack>
        )}

        {/* El saldo sin gastar es costo futuro: aún no resta de la ganancia,
            pero lo hará cuando el cliente lo consuma. */}
        {!loadingEconomics && economics && economics.balance > 0 && (
          <Text as="p" tone="subdued" variant="bodySm">
            {`Pendiente: ${economics.balance.toLocaleString("es-ES")} crédito(s) sin gastar`}
            {/* Sin costo medio no hay nada que estimar: mejor callarlo que dar
                un 0 engañoso. */}
            {economics.unitCost !== null &&
              `, ≈ ${fmtCreditCost(economics.outstandingLiability, economics.baseCurrency)} de costo futuro`}
            .
          </Text>
        )}

        {/* Las tarifas se editan aquí mismo: una que esté a 0 registra los
            costes en cero sin avisar. */}
        <InlineStack align="end">
          <Button onClick={() => setRatesOpen(true)}>
            Ver tarifas de proveedor
          </Button>
        </InlineStack>

        <RatesModal open={ratesOpen} onClose={() => setRatesOpen(false)} />
      </BlockStack>
    </Card>
  );
}

/** Fila etiqueta/valor de la columna lateral, como el desglose de categorías. */
function SummaryRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "success" | "critical";
}) {
  return (
    <InlineStack align="space-between" blockAlign="center">
      <Text as="span" fontWeight={strong ? "semibold" : undefined}>
        {label}
      </Text>
      <Text
        as="span"
        tone={tone}
        fontWeight={strong ? "semibold" : undefined}
      >
        {value}
      </Text>
    </InlineStack>
  );
}
