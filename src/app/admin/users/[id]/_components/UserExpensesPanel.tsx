"use client";

import { useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineGrid,
  InlineStack,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import {
  AdminUserCreditEconomics,
  CustomerExpenses,
} from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { fmtCreditCost } from "@/entities/admin/lib/credit-format";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { useUserExpenses } from "../useUserExpenses";
import { ExpenseRow } from "./ExpenseRow";
import { ExpensesBreakdown } from "./ExpensesBreakdown";
import { RatesModal } from "./RatesModal";

interface UserExpensesPanelProps {
  userId: string;
  /** Totales ya cargados por `useUserDetail`: la cabecera no vuelve a pedirlos. */
  expenses: CustomerExpenses | null;
  loadingSummary: boolean;
  /** Ya cargada por la página para la card lateral: aquí valora el saldo. */
  economics: AdminUserCreditEconomics | null;
  loadingEconomics: boolean;
}

/**
 * Pestaña "Gastos": totales por categoría arriba y el desglose paginado de cada
 * movimiento debajo, con su detalle técnico desplegable.
 */
export function UserExpensesPanel({
  userId,
  expenses,
  loadingSummary,
  economics,
  loadingEconomics,
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
          economics={loadingEconomics ? null : economics}
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

/**
 * Cabecera de la pestaña: las cifras clave como tiles y, debajo, el desglose por
 * categoría. Los tiles separan lo gastado (movimientos ya registrados) de la
 * proyección (el saldo de créditos por consumir), que si no se leería como un
 * gasto más pese a poder pesar veinte veces más.
 */
function ExpensesSummary({
  expenses,
  economics,
  onShowRates,
}: {
  expenses: CustomerExpenses;
  economics: AdminUserCreditEconomics | null;
  onShowRates: () => void;
}) {
  const tiles = buildTotals(expenses, economics);
  // Con un solo tile el desglose conserva su propio total: no hay proyección de
  // la que distinguirlo.
  const hasProjection = tiles.length > 1;

  return (
    <BlockStack gap="400">
      <ExpensesTotals tiles={tiles} />

      <Card>
        <BlockStack gap="200">
          <Text variant="headingSm" as="h3">
            Desglose por categoría
          </Text>

          <ExpensesBreakdown expenses={expenses} showTotal={!hasProjection} />

          {economics && economics.balance > 0 && (
            <Text as="p" tone="subdued" variant="bodySm">
              {economics.unitCost === null
                ? "Aún no hay generaciones con costo registrado: el saldo no se puede valorar."
                : ``}
            </Text>
          )}

          {/* Sin coste real del proveedor, estos totales solo valen lo que
              valgan las tarifas: una a 0 registra los gastos en cero sin
              avisar, y ahí es donde se corrige. */}
          <InlineStack gap="200" blockAlign="center">
            <Text as="span" tone="subdued" variant="bodySm">
              fal.ai no informa del coste de generación de imágenes ni de
              upscaling: esas tarifas se mantienen a mano.
            </Text>
            <Button variant="plain" size="slim" onClick={onShowRates}>
              Ver tarifas
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

interface TotalTile {
  label: string;
  value: string;
  /** Contexto del número: de dónde sale o qué lo hace aproximado. */
  detail: string;
  /** Atenúa el importe: lo que no es dinero ya gastado no se lee igual. */
  projected?: boolean;
}

/**
 * Las cifras que encabezan la pestaña. "Gastado" siempre; la proyección solo si
 * el usuario tiene saldo, y el total estimado solo si además hay costo medio con
 * el que valorarlo — sin él la suma sería idéntica a lo gastado y repetirla bajo
 * otro nombre es justo la confusión que se quiere evitar.
 */
function buildTotals(
  expenses: CustomerExpenses,
  economics: AdminUserCreditEconomics | null,
): TotalTile[] {
  const tiles: TotalTile[] = [
    {
      label: "Gastado",
      value: `≈ ${fmtCurrency(expenses.grandTotal, expenses.baseCurrency)}`,
      detail: `${expenses.count.toLocaleString("es-ES")} movimiento(s)`,
    },
  ];

  if (!economics || economics.balance <= 0) return tiles;

  const { baseCurrency, unitCost, outstandingLiability } = economics;

  tiles.push({
    label: "Costo futuro",
    // Sin costo medio no hay nada que estimar: mejor "—" que un 0 engañoso.
    value:
      unitCost === null
        ? "—"
        : `≈ ${fmtCreditCost(outstandingLiability, baseCurrency)}`,
    detail: `${economics.balance.toLocaleString("es-ES")} crédito(s) sin gastar`,
    projected: true,
  });

  if (unitCost !== null) {
    tiles.push({
      label: "Total estimado",
      value: `≈ ${fmtCreditCost(expenses.grandTotal + outstandingLiability, baseCurrency)}`,
      detail: "Gastado + costo futuro",
      projected: true,
    });
  }

  return tiles;
}

/** Fila de cifras al estilo de `UserStatsCard`: sin padding, cada celda el suyo. */
function ExpensesTotals({ tiles }: { tiles: TotalTile[] }) {
  return (
    <Card padding="0">
      <InlineGrid columns={{ xs: 1, sm: tiles.length }} gap="0">
        {tiles.map((tile, i) => (
          <Box
            key={tile.label}
            padding="400"
            borderInlineStartWidth={i === 0 ? "0" : "025"}
            borderColor="border"
          >
            <BlockStack gap="100">
              <Text variant="bodySm" fontWeight="semibold" as="span">
                {tile.label}
              </Text>
              <Text
                variant="headingMd"
                as="span"
                tone={tile.projected ? "subdued" : undefined}
              >
                {tile.value}
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                {tile.detail}
              </Text>
            </BlockStack>
          </Box>
        ))}
      </InlineGrid>
    </Card>
  );
}
