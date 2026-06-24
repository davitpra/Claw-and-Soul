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
  Modal,
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

const STATUS_OPTIONS = [
  { label: "Pagado", value: "paid" },
  { label: "En producción", value: "in_production" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregado", value: "delivered" },
  { label: "Cancelado", value: "cancelled" },
  { label: "Reembolsado", value: "refunded" },
];

const METHOD_OPTIONS = [
  { label: "Taller", value: "in_house" },
  { label: "POD", value: "pod" },
];

// Estado de fulfillment de Shopify (columna `fulfillment_status`). "unfulfilled"
// representa el valor null que devuelve Shopify cuando aún no hay fulfillment.
const FULFILLMENT_OPTIONS = [
  { label: "Unfulfilled", value: "unfulfilled" },
  { label: "Partially fulfilled", value: "partial" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Restocked", value: "restocked" },
];

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
  const [testingPod, setTestingPod] = useState(false);
  const [podHealthMsg, setPodHealthMsg] = useState<{
    text: string;
    tone: "success" | "critical";
  } | null>(null);

  // POD switch state
  const [podEnabled, setPodEnabled] = useState<boolean | null>(null);
  const [podToggling, setPodToggling] = useState(false);
  const [podSwitchMsg, setPodSwitchMsg] = useState<{
    text: string;
    tone: "success" | "critical";
  } | null>(null);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);

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

  // Load POD setting on mount
  useEffect(() => {
    adminApi.orders
      .podSettings()
      .then((res) => setPodEnabled(res.enabled))
      .catch(() => {});
  }, []);

  async function handleTestPod() {
    setTestingPod(true);
    setPodHealthMsg(null);
    try {
      const results = await adminApi.orders.podHealth();
      const allOk = results.every((r) => r.ok);
      const lines = results.map((r) =>
        r.ok
          ? `✓ ${r.provider} · ${r.apiUrl}`
          : `✗ ${r.provider}: ${r.message}`,
      );
      setPodHealthMsg({
        text: lines.join(" | "),
        tone: allOk ? "success" : "critical",
      });
    } catch (err) {
      setPodHealthMsg({
        text: `Error: ${(err as Error).message}`,
        tone: "critical",
      });
    } finally {
      setTestingPod(false);
    }
  }

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

  function handlePodToggleRequest() {
    if (!podEnabled) {
      // Activar es la acción peligrosa → pedir confirmación
      setConfirmActivateOpen(true);
    } else {
      // Desactivar es seguro → directo
      applyPodEnabled(false);
    }
  }

  async function applyPodEnabled(next: boolean) {
    setPodToggling(true);
    setPodSwitchMsg(null);
    try {
      const res = await adminApi.orders.podSetEnabled(next);
      setPodEnabled(res.enabled);
      setPodSwitchMsg({
        text: res.enabled
          ? "Envío automático a Pictorem activado. Los nuevos pedidos pagados se enviarán a producción."
          : "Envío automático a Pictorem desactivado. Los pedidos pagados quedarán pendientes.",
        tone: res.enabled ? "success" : "critical",
      });
    } catch (err) {
      setPodSwitchMsg({
        text: `Error al cambiar el estado: ${(err as Error).message}`,
        tone: "critical",
      });
    } finally {
      setPodToggling(false);
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
            label: PRODUCTION_STATUS_LABELS[status[0]] ?? status[0],
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
            label: method[0] === "in_house" ? "Taller" : "POD",
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
            label:
              FULFILLMENT_OPTIONS.find((o) => o.value === fulfillment[0])
                ?.label ?? fulfillment[0],
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
      secondaryActions={[
        {
          content: testingPod ? "Probando…" : "Probar conexión Pictorem",
          loading: testingPod,
          onAction: handleTestPod,
        },
      ]}
    >
      <BlockStack gap="400">
        {podHealthMsg && (
          <Banner
            tone={podHealthMsg.tone}
            onDismiss={() => setPodHealthMsg(null)}
          >
            {podHealthMsg.text}
          </Banner>
        )}
        {syncMsg && (
          <Banner tone={syncMsg.tone} onDismiss={() => setSyncMsg(null)}>
            {syncMsg.text}
          </Banner>
        )}
        {podSwitchMsg && (
          <Banner
            tone={podSwitchMsg.tone}
            onDismiss={() => setPodSwitchMsg(null)}
          >
            {podSwitchMsg.text}
          </Banner>
        )}

        {/* POD auto-fulfillment switch */}
        {/* <Card>
          <InlineStack align="space-between" blockAlign="center" gap="400">
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text variant="headingSm" as="h2">
                  Envío automático a Pictorem (POD)
                </Text>
                {podEnabled === null ? (
                  <Spinner size="small" />
                ) : (
                  <Badge tone={podEnabled ? "success" : "critical"}>
                    {podEnabled ? "Activo" : "Desactivado"}
                  </Badge>
                )}
              </InlineStack>
              <Text as="p" tone="subdued" variant="bodySm">
                {podEnabled
                  ? "Los pedidos pagados se envían automáticamente a Pictorem para producción."
                  : "Los pedidos pagados quedan pendientes y no se envían a Pictorem. Útil en modo testeo."}
              </Text>
            </BlockStack>
            <Button
              variant={podEnabled ? "secondary" : "primary"}
              loading={podToggling}
              disabled={podEnabled === null}
              onClick={handlePodToggleRequest}
            >
              {podEnabled ? "Desactivar" : "Activar"}
            </Button>
          </InlineStack>
        </Card> */}

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

      {/* Confirmation modal: only shown when activating (dangerous direction) */}
      <Modal
        open={confirmActivateOpen}
        onClose={() => setConfirmActivateOpen(false)}
        title="¿Activar envío automático a Pictorem?"
        primaryAction={{
          content: "Sí, activar",
          destructive: false,
          loading: podToggling,
          onAction: () => {
            setConfirmActivateOpen(false);
            applyPodEnabled(true);
          },
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            onAction: () => setConfirmActivateOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">
              Al activar esta opción,{" "}
              <Text as="span" fontWeight="semibold">
                todos los pedidos pagados se enviarán automáticamente a Pictorem
              </Text>{" "}
              para producción real.
            </Text>
            <Text as="p" tone="subdued">
              Asegúrate de que no estás en modo de prueba. Los pedidos enviados
              a Pictorem generarán una orden de producción real y pueden tener
              coste.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
