"use client";

import { useState } from "react";
import {
  Banner,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import { CustomerExpenses } from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { useUserExpenses } from "../useUserExpenses";
import { ExpenseRow } from "./ExpenseRow";
import { ExpensesBreakdown } from "./ExpensesBreakdown";
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
        <ExpensesBreakdown expenses={expenses} />

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
