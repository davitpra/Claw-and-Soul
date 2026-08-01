"use client";

import { useState } from "react";
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import { CustomerExpenses } from "@/entities/admin/api";
import { ExpensesBreakdown } from "./ExpensesBreakdown";
import { RatesModal } from "./RatesModal";

interface UserExpensesCardProps {
  expenses: CustomerExpenses | null;
  loading: boolean;
}

/**
 * Coste acumulado que ha generado el cliente, desglosado por categoría. Los
 * importes son aproximados: vienen convertidos a la moneda base del backend.
 */
export function UserExpensesCard({
  expenses,
  loading,
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
