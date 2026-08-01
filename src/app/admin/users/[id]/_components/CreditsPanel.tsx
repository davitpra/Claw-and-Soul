"use client";

import {
  Badge,
  BlockStack,
  Box,
  Card,
  EmptyState,
  IndexTable,
  InlineStack,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import {
  creditAmountTone,
  creditReasonLabel,
  fmtCreditAmount,
  fmtCreditCost,
} from "@/entities/admin/lib/credit-format";
import { fmtAbsoluteDate } from "@/entities/admin/lib/user-format";
import { useUserCredits } from "../useUserCredits";
import { GrantCreditsCard } from "./GrantCreditsCard";

interface CreditsPanelProps {
  userId: string;
  /** Saldo actual del usuario, para el encabezado del panel de abono. */
  balance: number;
  /** Propaga el nuevo saldo al detalle de usuario tras un grant exitoso. */
  onGranted: (newBalance: number) => void;
  /** Moneda de la columna de costo; la fija el backend (`Expense.baseCurrency`). */
  baseCurrency: string;
}

/**
 * Pestaña "Créditos": panel para acreditar créditos y el historial paginado de
 * movimientos del ledger. Un abono refresca el historial en el sitio.
 *
 * Las cifras agregadas (saldo valorado, costo incurrido) viven en la card
 * lateral `UserExpensesCard`, que está siempre a la vista.
 */
export function CreditsPanel({
  userId,
  balance,
  onGranted,
  baseCurrency,
}: CreditsPanelProps) {
  const { transactions, loading, page, setPage, reload } =
    useUserCredits(userId);

  const handleGranted = (newBalance: number) => {
    onGranted(newBalance);
    reload();
  };

  return (
    <BlockStack gap="400">
      <GrantCreditsCard
        userId={userId}
        balance={balance}
        onGranted={handleGranted}
      />

      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Movimientos
        </Text>

        {loading ? (
          <InlineStack gap="300" blockAlign="center">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando movimientos…
            </Text>
          </InlineStack>
        ) : !transactions?.data.length ? (
          <EmptyState
            heading="Sin movimientos de créditos"
            image={ADMIN_EMPTY_STATE_IMAGE}
          >
            <Text as="p" tone="subdued">
              Este usuario aún no tiene movimientos de créditos.
            </Text>
          </EmptyState>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "movimiento", plural: "movimientos" }}
              itemCount={transactions.data.length}
              headings={[
                { title: "Fecha" },
                { title: "Motivo" },
                { title: "Nota" },
                { title: "Monto" },
                { title: "Costo" },
              ]}
              selectable={false}
            >
              {transactions.data.map((t, i) => (
                <IndexTable.Row id={t.id} key={t.id} position={i}>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {fmtAbsoluteDate(t.createdAt)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" fontWeight="medium">
                      {creditReasonLabel(t.reason)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {t.note ?? "—"}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={creditAmountTone(t.amount)}>
                      {fmtCreditAmount(t.amount)}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {fmtCreditCost(t.costBase, baseCurrency)}
                    </Text>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>

            {transactions.meta.totalPages > 1 && (
              <Box
                padding="400"
                borderBlockStartWidth="025"
                borderColor="border"
              >
                <InlineStack align="center">
                  <Pagination
                    hasPrevious={page > 1}
                    hasNext={page < transactions.meta.totalPages}
                    onPrevious={() => setPage(page - 1)}
                    onNext={() => setPage(page + 1)}
                    label={`Página ${transactions.meta.page} de ${transactions.meta.totalPages}`}
                  />
                </InlineStack>
              </Box>
            )}
          </Card>
        )}
      </BlockStack>
    </BlockStack>
  );
}
