"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Collapsible,
  Divider,
  EmptyState,
  InlineStack,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import { CustomerExpenses, ExpenseItem } from "@/entities/admin/api";
import { EXPENSE_CATEGORY_LABELS } from "@/entities/admin/expense-labels";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { fmtCurrency, fmtShortDate } from "@/entities/admin/lib/order-format";
import { useUserExpenses } from "../useUserExpenses";
import { expenseDetailRows } from "./expense-detail";
import { RatesModal } from "./RatesModal";

interface UserExpensesPanelProps {
  userId: string;
  /** Totales ya cargados por `useUserDetail`: la cabecera no vuelve a pedirlos. */
  expenses: CustomerExpenses | null;
  loadingSummary: boolean;
}

/**
 * Pestaña "Gastos": totales por categoría arriba y el desglose paginado de cada
 * movimiento debajo, con su detalle técnico desplegable.
 */
export function UserExpensesPanel({
  userId,
  expenses,
  loadingSummary,
}: UserExpensesPanelProps) {
  const { items, loading, page, setPage } = useUserExpenses(userId);
  const [ratesOpen, setRatesOpen] = useState(false);
  const ratesModal = (
    <RatesModal open={ratesOpen} onClose={() => setRatesOpen(false)} />
  );

  if (loading || loadingSummary) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando gastos…
        </Text>
      </InlineStack>
    );
  }

  // El acceso a las tarifas se ofrece también sin gastos: una tarifa a 0 hace
  // que los costes se registren en cero sin avisar, y ahí es donde se corrige.
  if (!items?.data.length) {
    return (
      <>
        <EmptyState
          heading="Sin gastos registrados"
          image={ADMIN_EMPTY_STATE_IMAGE}
          action={{
            content: "Ver tarifas de proveedor",
            onAction: () => setRatesOpen(true),
          }}
        >
          <Text as="p" tone="subdued">
            Este usuario todavía no ha generado ningún coste.
          </Text>
        </EmptyState>
        {ratesModal}
      </>
    );
  }

  return (
    <BlockStack gap="400">
      {expenses && (
        <ExpensesSummary
          expenses={expenses}
          onShowRates={() => setRatesOpen(true)}
        />
      )}

      <BlockStack gap="200">
        <Text variant="headingSm" as="h3">
          Movimientos ({items.meta.total})
        </Text>
        {items.data.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} />
        ))}
      </BlockStack>

      {items.meta.totalPages > 1 && (
        <InlineStack align="center">
          <Pagination
            hasPrevious={page > 1}
            hasNext={page < items.meta.totalPages}
            onPrevious={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
            label={`Página ${items.meta.page} de ${items.meta.totalPages}`}
          />
        </InlineStack>
      )}

      {ratesModal}
    </BlockStack>
  );
}

/** Mismo desglose que la card lateral, como cabecera de la pestaña. */
function ExpensesSummary({
  expenses,
  onShowRates,
}: {
  expenses: CustomerExpenses;
  onShowRates: () => void;
}) {
  return (
    <Card>
      <BlockStack gap="200">
        {Object.entries(expenses.byCategory).map(([category, total]) => (
          <InlineStack key={category} align="space-between" blockAlign="center">
            <Text as="span" tone="subdued">
              {EXPENSE_CATEGORY_LABELS[category] ?? category}
            </Text>
            <Text as="span">
              ≈ {fmtCurrency(total, expenses.baseCurrency)}
            </Text>
          </InlineStack>
        ))}

        <Divider />

        <InlineStack align="space-between" blockAlign="center">
          <Text as="span" fontWeight="semibold">
            Total gastos
          </Text>
          <Text as="span" fontWeight="semibold">
            ≈ {fmtCurrency(expenses.grandTotal, expenses.baseCurrency)}
          </Text>
        </InlineStack>

        {/* Sin coste real del proveedor, estos totales solo valen lo que valgan
            las tarifas: una a 0 registra los gastos en cero sin avisar. */}
        <Banner
          tone="warning"
          action={{ content: "Ver tarifas", onAction: onShowRates }}
        >
          <Text as="p">
            fal.ai no informa del coste de generación de imágenes ni de
            upscaling: esas tarifas se mantienen a mano.
          </Text>
        </Banner>
      </BlockStack>
    </Card>
  );
}

function ExpenseRow({ expense }: { expense: ExpenseItem }) {
  const [open, setOpen] = useState(false);
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
          <>
            <InlineStack>
              <Button
                variant="plain"
                size="slim"
                disclosure={open ? "up" : "down"}
                onClick={() => setOpen((prev) => !prev)}
                ariaExpanded={open}
                ariaControls={`expense-detail-${expense.id}`}
              >
                Detalle
              </Button>
            </InlineStack>
            <Collapsible open={open} id={`expense-detail-${expense.id}`}>
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
        )}
      </BlockStack>
    </Card>
  );
}
