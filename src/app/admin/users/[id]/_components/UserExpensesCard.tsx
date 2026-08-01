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
  CustomerExpenses,
} from "@/entities/admin/api";
import {
  fmtCreditCost,
  fmtUnitCost,
} from "@/entities/admin/lib/credit-format";
import { ExpensesBreakdown } from "./ExpensesBreakdown";
import { RatesModal } from "./RatesModal";

interface UserExpensesCardProps {
  expenses: CustomerExpenses | null;
  loading: boolean;
  /** Los créditos del cliente traducidos a dinero, por el lado del costo. */
  economics: AdminUserCreditEconomics | null;
  loadingEconomics: boolean;
}

/**
 * Coste acumulado que ha generado el cliente, desglosado por categoría, y la
 * traducción de sus créditos a dinero. Los importes son aproximados: vienen
 * convertidos a la moneda base del backend.
 */
export function UserExpensesCard({
  expenses,
  loading,
  economics,
  loadingEconomics,
}: UserExpensesCardProps) {
  const [ratesOpen, setRatesOpen] = useState(false);

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Gastos acumulados
        </Text>

        {loading && <Spinner size="small" />}

        {!loading && expenses?.count === 0 && (
          <Text as="p" tone="subdued">
            Sin gastos registrados aún.
          </Text>
        )}

        {!loading && expenses && expenses.count > 0 && (
          <ExpensesBreakdown expenses={expenses} />
        )}

        <Divider />

        <Text variant="headingSm" as="h3">
          Créditos
        </Text>

        {loadingEconomics && <Spinner size="small" />}

        {!loadingEconomics && economics && (
          <CreditEconomics economics={economics} />
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

/**
 * Un crédito se gasta en una generación y cada generación completada deja un
 * `Expense`, así que el saldo pendiente se puede valorar a costo. En columna
 * lateral no cabe una rejilla: se listan como el desglose de categorías.
 */
function CreditEconomics({
  economics,
}: {
  economics: AdminUserCreditEconomics;
}) {
  const { baseCurrency, unitCost } = economics;

  const rows = [
    {
      label: "Saldo",
      value: `${economics.balance.toLocaleString("es-ES")} crédito(s)`,
    },
    {
      label: "Costo futuro estimado",
      // Sin costo medio no hay nada que estimar: mejor "—" que un 0 engañoso.
      value: fmtCreditCost(
        unitCost === null ? null : economics.outstandingLiability,
        baseCurrency,
      ),
    },
    {
      label: "Créditos gastados",
      value: economics.creditsSpentNet.toLocaleString("es-ES"),
    },
    {
      label: "Costo real incurrido",
      value: fmtCreditCost(economics.generationCost, baseCurrency),
    },
  ];

  // Lo ya gastado más lo que costará servir el saldo: el costo total que este
  // cliente habrá generado cuando agote sus créditos.
  const totalEstimated = fmtCreditCost(
    unitCost === null
      ? null
      : economics.generationCost + economics.outstandingLiability,
    baseCurrency,
  );

  return (
    <BlockStack gap="200">
      {rows.map((row) => (
        <InlineStack key={row.label} align="space-between" blockAlign="center">
          <Text as="span" tone="subdued">
            {row.label}
          </Text>
          <Text as="span">{row.value}</Text>
        </InlineStack>
      ))}

      <Divider />

      <InlineStack align="space-between" blockAlign="center">
        <Text as="span" fontWeight="semibold">
          Costo total estimado
        </Text>
        <Text as="span" fontWeight="semibold">
          {totalEstimated}
        </Text>
      </InlineStack>

      <Text as="p" tone="subdued" variant="bodySm">
        {unitCost === null
          ? "Aún no hay generaciones con costo registrado."
          : `Estimado a ${fmtUnitCost(unitCost, baseCurrency)} por crédito (media de ${economics.unitCostSampleSize.toLocaleString("es-ES")} generaciones).`}
      </Text>
    </BlockStack>
  );
}
