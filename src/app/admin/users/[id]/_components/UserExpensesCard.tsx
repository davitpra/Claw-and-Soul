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
import { CustomerExpenses } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
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
          <BlockStack gap="200">
            {Object.entries(expenses.byCategory).map(([category, total]) => (
              <InlineStack
                key={category}
                align="space-between"
                blockAlign="center"
              >
                <Text as="span" tone="subdued">
                  {EXPENSE_CATEGORY_LABELS[category] ?? category}
                </Text>
                <Text as="span">
                  ≈ {fmtCurrency(total, expenses.baseCurrency)}
                </Text>
              </InlineStack>
            ))}

            {Object.keys(expenses.byCategory).length > 0 && <Divider />}

            <InlineStack align="space-between" blockAlign="center">
              <Text as="span" fontWeight="semibold">
                Total gastos
              </Text>
              <Text as="span" fontWeight="semibold">
                ≈ {fmtCurrency(expenses.grandTotal, expenses.baseCurrency)}
              </Text>
            </InlineStack>
          </BlockStack>
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
