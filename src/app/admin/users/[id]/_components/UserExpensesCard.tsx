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
 * Los gastos se muestran como TOTAL ESTIMADO —lo ya gastado más el costo futuro
 * del saldo sin consumir—, no como gasto real: un cliente con créditos regalados
 * sin usar parece más rentable de lo que será cuando los gaste. Sin costo medio
 * con el que valorar el saldo no hay estimación posible y se cae al gasto real.
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

  // La estimación necesita las tres fuentes: sin la de créditos, el total
  // cambiaría bajo los pies del admin al terminar de cargar.
  const loadingBalance = loadingRevenue || loading || loadingEconomics;
  // Todas vienen de la misma moneda base del backend; se toma la primera que haya.
  const currency =
    revenue?.baseCurrency ?? expenses?.baseCurrency ?? economics?.baseCurrency;

  const income = revenue?.total ?? 0;
  const spent = expenses?.grandTotal ?? 0;
  // Sin costo medio no hay nada que estimar: mejor el gasto real que inventar
  // un costo futuro de 0 para un saldo que sí costará algo.
  const futureCost =
    economics && economics.balance > 0 && economics.unitCost !== null
      ? economics.outstandingLiability
      : null;
  const estimated = futureCost !== null;
  const cost = spent + (futureCost ?? 0);
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
                label={estimated ? "Gastos (estimado)" : "Gastos"}
                value={`≈ ${fmtCurrency(cost, currency)}`}
              />
              {/* El desglose por categoría vive en la pestaña "Gastos": aquí
                  solo interesa el total que resta de la ganancia. */}
              <Text as="p" tone="subdued" variant="bodySm">
                {expenses && expenses.count > 0
                  ? `${expenses.count.toLocaleString("es-ES")} gasto(s) registrado(s)`
                  : "Sin gastos registrados aún"}
              </Text>
              {/* Un total que mezcla dinero ya gastado con dinero por gastar
                  tiene que decirlo, y decir cuánto es cada parte. */}
              {estimated && economics && (
                <Text as="p" tone="subdued" variant="bodySm">
                  {`No es el gasto real: estimado = ≈ ${fmtCurrency(spent, currency)} gastado + ≈ ${fmtCreditCost(futureCost, currency)} de costo futuro por ${economics.balance.toLocaleString("es-ES")} crédito(s) sin gastar.`}
                </Text>
              )}
            </BlockStack>

            <Divider />

            <SummaryRow
              label={estimated ? "Ganancia (estimada)" : "Ganancia"}
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

        {/* Cuando sí hay estimación el saldo ya se explica junto al total; esta
            línea es solo para el caso en que no se puede valorar. */}
        {!loadingBalance && !estimated && economics && economics.balance > 0 && (
          <Text as="p" tone="subdued" variant="bodySm">
            {`Pendiente: ${economics.balance.toLocaleString("es-ES")} crédito(s) sin gastar, todavía sin costo medio con el que estimar su costo futuro.`}
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
