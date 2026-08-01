"use client";

import { BlockStack, Divider, InlineStack, Text } from "@shopify/polaris";
import { CustomerExpenses } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { fmtCurrency } from "@/entities/admin/lib/order-format";

/**
 * Desglose por categoría + total, en la moneda base del backend (de ahí el "≈").
 * Cabecera de la pestaña "Gastos". Cuando esa cabecera ya muestra el total como
 * tile va con `showTotal` en `false`, para no dar dos veces la misma cifra.
 */
export function ExpensesBreakdown({
  expenses,
  showTotal = true,
}: {
  expenses: CustomerExpenses;
  showTotal?: boolean;
}) {
  const categories = Object.entries(expenses.byCategory);

  return (
    <BlockStack gap="200">
      {categories.map(([category, total]) => (
        <InlineStack key={category} align="space-between" blockAlign="center">
          <Text as="span" tone="subdued">
            {EXPENSE_CATEGORY_LABELS[category] ?? category}
          </Text>
          <Text as="span">≈ {fmtCurrency(total, expenses.baseCurrency)}</Text>
        </InlineStack>
      ))}

      {showTotal && (
        <>
          {categories.length > 0 && <Divider />}

          <InlineStack align="space-between" blockAlign="center">
            <Text as="span" fontWeight="semibold">
              Total gastos
            </Text>
            <Text as="span" fontWeight="semibold">
              ≈ {fmtCurrency(expenses.grandTotal, expenses.baseCurrency)}
            </Text>
          </InlineStack>
        </>
      )}
    </BlockStack>
  );
}
