"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Card,
  IndexTable,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Filters,
  Pagination,
  ChoiceList,
  EmptyState,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import { adminApi, AdminOrderListItem, Paginated } from "@/entities/admin/api";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_TONES as STATUS_TONES,
} from "@/entities/admin/lib/production-status";
import {
  resolveFulfillmentStatus,
  fulfillmentLabel,
  fulfillmentTone,
} from "@/entities/admin/lib/fulfillment-status";
import {
  STATUS_OPTIONS,
  METHOD_OPTIONS,
  FULFILLMENT_OPTIONS,
  filterOptionLabel,
} from "@/entities/admin/lib/order-filters";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getOrderStatus(items: AdminOrderListItem["items"]): string {
  if (!items.length) return "paid";
  const statuses = [...new Set(items.map((i) => i.productionStatus))];
  return statuses.length === 1 ? statuses[0] : "mixed";
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Paginated<AdminOrderListItem> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [method, setMethod] = useState<string[]>([]);
  const [fulfillment, setFulfillment] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{
    text: string;
    tone: "info" | "success" | "critical";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders.list({
        page,
        q: q || undefined,
        status: status[0] || undefined,
        method: method[0] || undefined,
        fulfillmentStatus: fulfillment[0] || undefined,
      });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [page, q, status, method, fulfillment]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await adminApi.orders.triggerSync();
      setSyncMsg({
        text: `Sincronización iniciada (ID: ${res.syncId})`,
        tone: "info",
      });
      setTimeout(() => load(), 3000);
    } catch (err) {
      setSyncMsg({
        text: `Error: ${(err as Error).message}`,
        tone: "critical",
      });
    } finally {
      setSyncing(false);
    }
  }

  const filters = [
    {
      key: "status",
      label: "Estado",
      filter: (
        <ChoiceList
          title="Estado de producción"
          titleHidden
          choices={STATUS_OPTIONS}
          selected={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
      ),
      shortcut: true,
    },
    {
      key: "method",
      label: "Método",
      filter: (
        <ChoiceList
          title="Método de fabricación"
          titleHidden
          choices={METHOD_OPTIONS}
          selected={method}
          onChange={(v) => {
            setMethod(v);
            setPage(1);
          }}
        />
      ),
    },
    {
      key: "fulfillment",
      label: "Shopify",
      filter: (
        <ChoiceList
          title="Estado de Shopify"
          titleHidden
          choices={FULFILLMENT_OPTIONS}
          selected={fulfillment}
          onChange={(v) => {
            setFulfillment(v);
            setPage(1);
          }}
        />
      ),
    },
  ];

  const appliedFilters = [
    ...(status.length
      ? [
          {
            key: "status",
            label: filterOptionLabel(STATUS_OPTIONS, status[0]),
            onRemove: () => {
              setStatus([]);
              setPage(1);
            },
          },
        ]
      : []),
    ...(method.length
      ? [
          {
            key: "method",
            label: filterOptionLabel(METHOD_OPTIONS, method[0]),
            onRemove: () => {
              setMethod([]);
              setPage(1);
            },
          },
        ]
      : []),
    ...(fulfillment.length
      ? [
          {
            key: "fulfillment",
            label: filterOptionLabel(FULFILLMENT_OPTIONS, fulfillment[0]),
            onRemove: () => {
              setFulfillment([]);
              setPage(1);
            },
          },
        ]
      : []),
  ];

  return (
    <Page
      title="Pedidos"
      subtitle="Gestión de pedidos y fabricación"
      primaryAction={{
        content: "Sincronizar desde Shopify",
        icon: RefreshIcon,
        loading: syncing,
        onAction: handleSync,
      }}
    >
      <BlockStack gap="400">
        {syncMsg && (
          <Banner tone={syncMsg.tone} onDismiss={() => setSyncMsg(null)}>
            {syncMsg.text}
          </Banner>
        )}

        <Card padding="0">
          <Box
            paddingInline="400"
            paddingBlock="300"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <Filters
              queryValue={q}
              filters={filters}
              appliedFilters={appliedFilters}
              onQueryChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              onQueryClear={() => {
                setQ("");
                setPage(1);
              }}
              onClearAll={() => {
                setQ("");
                setStatus([]);
                setMethod([]);
                setFulfillment([]);
                setPage(1);
              }}
              queryPlaceholder="Buscar # pedido o email…"
            />
          </Box>

          {loading ? (
            <Box padding="600">
              <InlineStack align="center" gap="300">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando pedidos…
                </Text>
              </InlineStack>
            </Box>
          ) : !orders?.data.length ? (
            <EmptyState
              heading="No hay pedidos con estos filtros"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <Text as="p" tone="subdued">
                Intenta ajustar los filtros o sincronizar desde Shopify.
              </Text>
            </EmptyState>
          ) : (
            <IndexTable
              resourceName={{ singular: "pedido", plural: "pedidos" }}
              itemCount={orders.data.length}
              headings={[
                { title: "# Pedido" },
                { title: "Cliente" },
                { title: "Items" },
                { title: "Total" },
                { title: "Estado" },
                { title: "Shopify" },
                { title: "Fecha" },
              ]}
              selectable={false}
            >
              {orders.data.map((order, index) => {
                const orderStatus = getOrderStatus(order.items);
                // El endpoint de lista no trae `fulfillmentDisplayStatus`, así
                // que el helper cae al `fulfillmentStatus` simple de Shopify.
                const shopifyStatus = resolveFulfillmentStatus({
                  fulfillmentDisplayStatus: null,
                  fulfillmentStatus: order.fulfillmentStatus,
                });
                const titles = order.items
                  .slice(0, 3)
                  .map((i) => i.title)
                  .filter(Boolean) as string[];

                return (
                  <IndexTable.Row
                    id={order.id}
                    key={order.id}
                    position={index}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <IndexTable.Cell>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {order.orderNumber}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {order.userId ? (
                        <Text as="span" variant="bodySm">
                          {order.customerName || order.customerEmail || "—"}
                        </Text>
                      ) : (
                        <Text as="span" tone="subdued">
                          {order.customerEmail || "Invitado"}
                        </Text>
                      )}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {titles.length > 0 ? (
                        <BlockStack gap="050">
                          {titles.map((title, idx) => (
                            <Text key={idx} as="span" variant="bodySm">
                              {title}
                            </Text>
                          ))}
                          {order.items.length > 3 && (
                            <Text as="span" tone="subdued" variant="bodySm">
                              +{order.items.length - 3}
                            </Text>
                          )}
                        </BlockStack>
                      ) : (
                        <Text as="span" tone="subdued" variant="bodySm">
                          {order.items.length} item(s)
                        </Text>
                      )}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {fmtCurrency(order.totalAmount, order.currency)}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={STATUS_TONES[orderStatus] ?? "enabled"}>
                        {PRODUCTION_STATUS_LABELS[orderStatus] ?? orderStatus}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={fulfillmentTone(shopifyStatus)}>
                        {fulfillmentLabel(shopifyStatus)}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text as="span" tone="subdued">
                        {fmtDate(order.shopifyCreatedAt)}
                      </Text>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
            </IndexTable>
          )}

          {orders && orders.meta.totalPages > 1 && (
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <InlineStack align="space-between">
                <Text as="span" tone="subdued" variant="bodySm">
                  {orders.meta.total} pedido(s) · Página {orders.meta.page} de{" "}
                  {orders.meta.totalPages}
                </Text>
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page < orders.meta.totalPages}
                  onPrevious={() => setPage((p) => p - 1)}
                  onNext={() => setPage((p) => p + 1)}
                />
              </InlineStack>
            </Box>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
