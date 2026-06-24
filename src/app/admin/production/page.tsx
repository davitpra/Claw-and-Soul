"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Page,
  Card,
  Tabs,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Thumbnail,
  Select,
  EmptyState,
} from "@shopify/polaris";
import { RefreshIcon, ImageIcon } from "@shopify/polaris-icons";
import { adminApi, ProductionQueueOrder } from "@/entities/admin/api";
import {
  FULFILLMENT_DISPLAY_LABELS,
  FULFILLMENT_DISPLAY_TONES,
  FULFILLMENT_STAGES,
  resolveFulfillmentStatus,
  stageForFulfillment,
} from "@/entities/admin/lib/fulfillment-status";

const METHOD_OPTIONS = [
  { label: "Todos los métodos", value: "" },
  { label: "Taller", value: "in_house" },
  { label: "POD (Pictorem)", value: "pod" },
];

function waitLabel(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "1 día esperando";
  return `${days} días esperando`;
}

function methodLabel(method: string): string {
  return method === "pod" ? "POD" : "Taller";
}

function PrintChip({
  item,
}: {
  item: ProductionQueueOrder["items"][number];
}) {
  const src = item.generation?.resultUrl ?? item.imageUrl ?? null;
  const isPod = item.fulfillmentMethod === "pod";
  return (
    <Box
      padding="200"
      borderColor="border"
      borderWidth="025"
      borderRadius="200"
      background="bg-surface-secondary"
    >
      <InlineStack gap="300" blockAlign="center" wrap={false}>
        <Thumbnail size="small" source={src ?? ImageIcon} alt={item.title} />
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="medium" truncate>
            {item.title}
          </Text>
          <InlineStack gap="150" blockAlign="center">
            <Badge tone={isPod ? "info" : undefined} size="small">
              {methodLabel(item.fulfillmentMethod)}
            </Badge>
          </InlineStack>
        </BlockStack>
      </InlineStack>
    </Box>
  );
}

function OrderCard({ order }: { order: ProductionQueueOrder }) {
  const status = resolveFulfillmentStatus(order);
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <BlockStack gap="050">
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="headingMd" fontWeight="bold">
                #{order.orderNumber}
              </Text>
              <Badge tone={FULFILLMENT_DISPLAY_TONES[status] ?? "enabled"}>
                {FULFILLMENT_DISPLAY_LABELS[status] ?? status}
              </Badge>
            </InlineStack>
            <Text as="span" variant="bodySm" tone="subdued">
              {order.customerName || order.customerEmail || "Invitado"} ·{" "}
              {waitLabel(order.shopifyCreatedAt)}
            </Text>
          </BlockStack>
          <Link href={`/admin/orders/${order.id}`}>
            <Button>Abrir</Button>
          </Link>
        </InlineStack>
        <InlineStack gap="200" wrap>
          {order.items.map((item) => (
            <PrintChip key={item.id} item={item} />
          ))}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

export default function AdminProductionPage() {
  const [orders, setOrders] = useState<ProductionQueueOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.orders.productionQueue(
        method ? { method } : {},
      );
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [method]);

  useEffect(() => {
    load();
  }, [load]);

  const buckets = useMemo(() => {
    const groups: Record<string, ProductionQueueOrder[]> = {
      unfulfilled: [],
      in_progress: [],
      on_hold: [],
      fulfilled: [],
    };
    for (const order of orders ?? []) {
      const stage = stageForFulfillment(resolveFulfillmentStatus(order));
      groups[stage].push(order);
    }
    return groups;
  }, [orders]);

  const tabs = FULFILLMENT_STAGES.map((stage) => ({
    id: stage.key,
    content: `${stage.label} (${buckets[stage.key].length})`,
  }));

  const currentStage = FULFILLMENT_STAGES[selectedTab];
  const currentOrders = buckets[currentStage.key];

  return (
    <Page
      title="Producción"
      subtitle="Cola del estudio de impresión — agrupada por el estado de fulfillment de Shopify"
      primaryAction={{
        content: "Actualizar",
        icon: RefreshIcon,
        onAction: load,
        loading,
      }}
    >
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" title="No se pudo cargar la cola">
            {error}
          </Banner>
        )}

        <InlineStack align="start">
          <Box minWidth="220px">
            <Select
              label="Método"
              labelInline
              options={METHOD_OPTIONS}
              value={method}
              onChange={setMethod}
            />
          </Box>
        </InlineStack>

        <Card padding="0">
          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={setSelectedTab}
          >
            <Box padding="400">
              {loading && !orders ? (
                <InlineStack align="center">
                  <Spinner accessibilityLabel="Cargando cola" size="large" />
                </InlineStack>
              ) : currentOrders.length === 0 ? (
                <EmptyState
                  heading="Nada en esta etapa"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No hay pedidos en «{currentStage.label}» ahora mismo.</p>
                </EmptyState>
              ) : (
                <BlockStack gap="300">
                  {currentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </BlockStack>
              )}
            </Box>
          </Tabs>
        </Card>
      </BlockStack>
    </Page>
  );
}
