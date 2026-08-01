"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BlockStack,
  Button,
  Card,
  Collapsible,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { ExpenseItem } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { fmtCurrency, fmtShortDate } from "@/entities/admin/lib/order-format";
import { DetailRow, expenseDetailRows } from "./expense-detail";

/** Un movimiento de gasto, con su detalle técnico desplegable. */
export function ExpenseRow({ expense }: { expense: ExpenseItem }) {
  const rows = expenseDetailRows(expense);
  // Solo se muestra la conversión cuando de verdad hubo cambio de moneda.
  const converted =
    expense.amountBase !== null &&
    expense.baseCurrency !== null &&
    expense.baseCurrency !== expense.currency;

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start" gap="200">
          <BlockStack gap="050">
            <Text as="span" fontWeight="semibold">
              {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {fmtShortDate(expense.createdAt)}
              {expense.provider && ` · ${expense.provider}`}
              {expense.note && ` · ${expense.note}`}
            </Text>
            {expense.orderId && (
              // `Link` de Next y no el de Polaris: el AppProvider no tiene
              // `linkComponent`, así que el de Polaris recargaría la página.
              <Link
                href={`/admin/orders/${expense.orderId}`}
                style={{ color: "var(--p-color-text-emphasis)" }}
              >
                <Text as="span" variant="bodySm">
                  Ver pedido
                </Text>
              </Link>
            )}
          </BlockStack>

          <BlockStack gap="050" inlineAlign="end">
            <Text as="span" fontWeight="semibold">
              {fmtCurrency(expense.amount, expense.currency)}
            </Text>
            {converted && (
              <Text as="span" variant="bodySm" tone="subdued">
                ≈ {fmtCurrency(expense.amountBase!, expense.baseCurrency!)}
              </Text>
            )}
          </BlockStack>
        </InlineStack>

        {rows.length > 0 && (
          <ExpenseDetail id={`expense-detail-${expense.id}`} rows={rows} />
        )}
      </BlockStack>
    </Card>
  );
}

function ExpenseDetail({ id, rows }: { id: string; rows: DetailRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <InlineStack>
        <Button
          variant="plain"
          size="slim"
          disclosure={open ? "up" : "down"}
          onClick={() => setOpen((prev) => !prev)}
          ariaExpanded={open}
          ariaControls={id}
        >
          Detalle
        </Button>
      </InlineStack>
      <Collapsible open={open} id={id}>
        <BlockStack gap="100">
          <Divider />
          {rows.map((row) => (
            <InlineStack
              key={row.label}
              align="space-between"
              blockAlign="center"
              gap="200"
            >
              <Text as="span" variant="bodySm" tone="subdued">
                {row.label}
              </Text>
              <Text as="span" variant="bodySm">
                {row.value}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
      </Collapsible>
    </>
  );
}
