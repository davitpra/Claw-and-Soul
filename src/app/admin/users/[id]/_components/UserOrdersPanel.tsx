"use client";

import Link from "next/link";
import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Pagination,
  Spinner,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { AdminUserOrderListItem } from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { fmtCurrency, fmtShortDate } from "@/entities/admin/lib/order-format";
import { PRODUCTION_STATUS_LABELS } from "@/entities/admin/lib/production-status";
import { useUserOrders } from "../useUserOrders";

/** Pestaña "Pedidos": pedidos del usuario, cada fila enlaza a su detalle. */
export function UserOrdersPanel({ userId }: { userId: string }) {
  const { orders, loading, page, setPage } = useUserOrders(userId);

  if (loading) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando pedidos…
        </Text>
      </InlineStack>
    );
  }

  if (!orders?.data.length) {
    return (
      <EmptyState
        heading="Sin pedidos registrados"
        image={ADMIN_EMPTY_STATE_IMAGE}
      >
        <Text as="p" tone="subdued">
          No se encontraron pedidos para este usuario.
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="300">
      {orders.data.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}

      {orders.meta.totalPages > 1 && (
        <InlineStack align="center">
          <Pagination
            hasPrevious={page > 1}
            hasNext={page < orders.meta.totalPages}
            onPrevious={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
            label={`Página ${orders.meta.page} de ${orders.meta.totalPages}`}
          />
        </InlineStack>
      )}
    </BlockStack>
  );
}

function OrderRow({ order }: { order: AdminUserOrderListItem }) {
  const thumb = order.items[0]?.generation?.resultUrl ?? order.items[0]?.imageUrl;
  // Un pedido puede tener varios items en el mismo estado; se muestra uno por
  // estado distinto para no repetir el mismo badge.
  const statuses = [...new Set(order.items.map((i) => i.productionStatus))];

  return (
    <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: "none" }}>
      <Card>
        <InlineStack gap="400" blockAlign="center">
          <div style={{ flexShrink: 0 }}>
            {thumb ? (
              <Thumbnail source={thumb} alt="" size="small" />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: "var(--p-color-bg-surface-secondary)",
                  border: "1px solid var(--p-color-border)",
                }}
              />
            )}
          </div>

          <BlockStack gap="0">
            <Text variant="bodyMd" fontWeight="semibold" as="span">
              {order.orderNumber}
            </Text>
            <Text variant="bodySm" tone="subdued" as="span">
              {fmtShortDate(order.shopifyCreatedAt)} · {order.items.length}{" "}
              item(s)
            </Text>
          </BlockStack>

          <BlockStack gap="100" inlineAlign="end">
            <Text variant="bodyMd" fontWeight="semibold" as="span">
              {fmtCurrency(order.totalAmount, order.currency)}
            </Text>
            <InlineStack gap="100">
              {statuses.map((status) => (
                <Badge key={status} size="small" tone="enabled">
                  {PRODUCTION_STATUS_LABELS[status] ?? status}
                </Badge>
              ))}
            </InlineStack>
          </BlockStack>
        </InlineStack>
      </Card>
    </Link>
  );
}
