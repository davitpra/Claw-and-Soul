"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Page,
  Card,
  IndexTable,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Pagination,
  Box,
} from "@shopify/polaris";
import {
  adminApi,
  AdminUserDetail,
  AdminUserListItem,
  AdminCreditTransaction,
  Paginated,
} from "@/entities/admin/api";
import { GrantCreditsModal } from "../_components/GrantCreditsModal";

const REASON_LABELS: Record<string, string> = {
  signup_bonus: "Bono de registro",
  order_bonus: "Bono por compra",
  pack_purchase: "Compra de pack",
  admin_grant: "Ajuste manual",
  generation_spend: "Generación de imagen",
  generation_refund: "Reembolso de generación",
  order_bonus_reversal: "Reversa de bono por compra",
  pack_purchase_reversal: "Reversa de compra de pack",
};

function reasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? reason;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUserCreditsPage() {
  const params = useParams();
  const userId = params.id as string;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [result, setResult] =
    useState<Paginated<AdminCreditTransaction> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      Promise.all([
        adminApi.users.detail(userId),
        adminApi.users.creditTransactions(userId, p),
      ])
        .then(([d, txns]) => {
          setDetail(d);
          setResult(txns);
          setLoading(false);
        })
        .catch((e: Error) => {
          setError(e.message);
          setLoading(false);
        });
    },
    [userId]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handleGranted = (newBalance: number) => {
    setDetail((prev) =>
      prev ? { ...prev, generationCredits: newBalance } : prev
    );
    // Un grant crea un nuevo movimiento admin_grant: recargar el historial.
    if (page === 1) load(1);
    else setPage(1);
  };

  // GrantCreditsModal espera un AdminUserListItem; construimos uno mínimo desde el detalle.
  const grantUser: AdminUserListItem | null = detail
    ? {
        ...detail,
        _count: { pets: detail.pets.length, generations: 0 },
      }
    : null;

  return (
    <Page
      title={detail ? detail.fullName || detail.email : "Movimientos de créditos"}
      subtitle={detail ? detail.email : undefined}
      backAction={{ content: "Créditos", url: "/admin/credits" }}
      titleMetadata={
        detail ? (
          <Badge tone="info">{`${detail.generationCredits} créditos`}</Badge>
        ) : undefined
      }
      primaryAction={
        detail
          ? { content: "Acreditar", onAction: () => setGrantOpen(true) }
          : undefined
      }
    >
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <Card padding="0">
          {loading ? (
            <Box padding="600">
              <InlineStack align="center" gap="300">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando movimientos…
                </Text>
              </InlineStack>
            </Box>
          ) : (
            <IndexTable
              resourceName={{ singular: "movimiento", plural: "movimientos" }}
              itemCount={result?.data.length ?? 0}
              headings={[
                { title: "Fecha" },
                { title: "Motivo" },
                { title: "Nota" },
                { title: "Monto" },
              ]}
              selectable={false}
              emptyState={
                <Box padding="600">
                  <InlineStack align="center">
                    <Text as="span" tone="subdued">
                      Este usuario aún no tiene movimientos de créditos.
                    </Text>
                  </InlineStack>
                </Box>
              }
            >
              {result?.data.map((t, i) => (
                <IndexTable.Row id={t.id} key={t.id} position={i}>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {formatDate(t.createdAt)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" fontWeight="medium">
                      {reasonLabel(t.reason)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {t.note ?? "—"}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={t.amount >= 0 ? "success" : "critical"}>
                      {`${t.amount >= 0 ? "+" : ""}${t.amount}`}
                    </Badge>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          )}

          {result && result.meta.totalPages > 1 && (
            <Box
              padding="400"
              borderBlockStartWidth="025"
              borderColor="border"
            >
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page < result.meta.totalPages}
                  onPrevious={() => setPage((p) => p - 1)}
                  onNext={() => setPage((p) => p + 1)}
                  label={`Página ${page} de ${result.meta.totalPages}`}
                />
              </InlineStack>
            </Box>
          )}
        </Card>
      </BlockStack>

      <GrantCreditsModal
        user={grantOpen ? grantUser : null}
        onClose={() => setGrantOpen(false)}
        onGranted={handleGranted}
      />
    </Page>
  );
}
