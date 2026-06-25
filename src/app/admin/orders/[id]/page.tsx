"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Page,
  Layout,
  Badge,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
} from "@shopify/polaris";
import { RefreshIcon, ExternalIcon } from "@shopify/polaris-icons";
import { adminApi, AdminOrderDetail } from "@/entities/admin/api";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_TONES as STATUS_TONES,
} from "@/entities/admin/lib/production-status";
import { CANCELLABLE_STATUSES } from "@/entities/admin/lib/order-transitions";
import {
  resolveFulfillmentStatus,
  fulfillmentLabel,
  fulfillmentTone,
} from "@/entities/admin/lib/fulfillment-status";
import {
  financialLabel,
  financialTone,
} from "@/entities/admin/lib/financial-status";
import { fmtDate } from "@/entities/admin/lib/order-format";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";
import { OrderItemCard } from "./_components/OrderItemCard";
import { CancelOrderModal } from "./_components/CancelOrderModal";
import { CustomerCard } from "./_components/CustomerCard";
import { OrderTotalsCard } from "./_components/OrderTotalsCard";
import { OrderEventsCard } from "./_components/OrderEventsCard";
import { RawPayloadCard } from "./_components/RawPayloadCard";

// Storefront ids are GIDs (gid://shopify/ProductVariant/123) but the order's
// productVariant stores the bare numeric id — key by the numeric tail to match.
const variantNumericId = (id: string) => id.split("/").pop() ?? id;

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [cancelItemIds, setCancelItemIds] = useState<string[] | null>(null);
  const [shopifyVariantImages, setShopifyVariantImages] = useState<
    Record<string, string>
  >({});

  // Best-effort: fetch the live Shopify variant image for each distinct product
  // handle in the order, keyed by numeric variant id (mismo patrón que la página
  // de producto admin).
  async function loadShopifyImages(order: AdminOrderDetail) {
    const handles = Array.from(
      new Set(
        order.items
          .map((i) => i.productRef?.shopifyHandle)
          .filter((h): h is string => !!h),
      ),
    );
    if (handles.length === 0) return;
    const byVariant: Record<string, string> = {};
    await Promise.all(
      handles.map(async (handle) => {
        try {
          const { data } = await shopifyFetch<{
            product: {
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    image: { url: string } | null;
                  };
                }>;
              };
            } | null;
          }>({ query: GET_PRODUCT, variables: { handle } });
          for (const { node } of data.product?.variants.edges ?? []) {
            if (node.image) {
              byVariant[variantNumericId(node.id)] = node.image.url;
            }
          }
        } catch {
          // best-effort
        }
      }),
    );
    setShopifyVariantImages(byVariant);
  }

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.orders.detail(id);
      setOrder(data);
      loadShopifyImages(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResync() {
    setResyncing(true);
    try {
      await adminApi.orders.resync(id);
      await load();
    } finally {
      setResyncing(false);
    }
  }

  if (loading) {
    return (
      <Box padding="600">
        <InlineStack align="center" gap="300">
          <Spinner />
          <Text as="span" tone="subdued">
            Cargando pedido…
          </Text>
        </InlineStack>
      </Box>
    );
  }

  if (!order) {
    return (
      <Page
        backAction={{ url: "/admin/orders", content: "Pedidos" }}
        title="Pedido no encontrado"
      >
        <Text as="p" tone="subdued">
          No se encontró el pedido.
        </Text>
      </Page>
    );
  }

  const shopifyAdminUrl = `https://clawandsoul.myshopify.com/admin/orders/${order.shopifyOrderId}`;

  const overallTones = order.items.map((i) => i.productionStatus);
  const dominantStatus =
    [...new Set(overallTones)].length === 1 ? overallTones[0] : "mixed";

  const fulfillment = resolveFulfillmentStatus({
    fulfillmentDisplayStatus: order.fulfillmentDisplayStatus,
    fulfillmentStatus: order.fulfillmentStatus,
  });

  const cancellableIds = order.items
    .filter((i) => CANCELLABLE_STATUSES.includes(i.productionStatus))
    .map((i) => i.id);

  return (
    <Page
      backAction={{ url: "/admin/orders", content: "Pedidos" }}
      title={order.orderNumber}
      subtitle={fmtDate(order.shopifyCreatedAt)}
      titleMetadata={
        <InlineStack gap="200" blockAlign="center">
          {order.financialStatus && (
            <Badge tone={financialTone(order.financialStatus)}>
              {financialLabel(order.financialStatus)}
            </Badge>
          )}
          <Badge tone={fulfillmentTone(fulfillment)}>
            {fulfillmentLabel(fulfillment)}
          </Badge>
          <Badge tone={STATUS_TONES[dominantStatus] ?? "enabled"}>
            {PRODUCTION_STATUS_LABELS[dominantStatus] ?? dominantStatus}
          </Badge>
        </InlineStack>
      }
      secondaryActions={[
        {
          content: "Resincronizar",
          icon: RefreshIcon,
          loading: resyncing,
          onAction: handleResync,
        },
        {
          content: "Cancelar pedido",
          destructive: true,
          disabled: cancellableIds.length === 0,
          onAction: () => setCancelItemIds(cancellableIds),
        },
        {
          content: "Ver en Shopify",
          icon: ExternalIcon,
          url: shopifyAdminUrl,
          external: true,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Items ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                orderId={id}
                currency={order.currency}
                shopifyImageUrl={
                  item.productVariant?.shopifyVariantId
                    ? (shopifyVariantImages[
                        variantNumericId(item.productVariant.shopifyVariantId)
                      ] ?? null)
                    : null
                }
                onUpdate={load}
                onRequestCancel={setCancelItemIds}
              />
            ))}

            <OrderEventsCard events={order.events} />

            <RawPayloadCard order={order} />
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <CustomerCard order={order} />
            <OrderTotalsCard order={order} orderId={id} onUpdate={load} />
          </BlockStack>
        </Layout.Section>
      </Layout>

      {cancelItemIds && (
        <CancelOrderModal
          order={order}
          itemIds={cancelItemIds}
          onClose={() => setCancelItemIds(null)}
          onDone={() => {
            setCancelItemIds(null);
            load();
          }}
        />
      )}
    </Page>
  );
}
