"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Pagination,
  ResourceItem,
  ResourceList,
  Spinner,
  Text,
} from "@shopify/polaris";
import {
  AdminUserOrderItem,
  AdminUserOrderListItem,
} from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import {
  financialLabel,
  financialTone,
} from "@/entities/admin/lib/financial-status";
import { fmtCurrency, fmtShortDate } from "@/entities/admin/lib/order-format";
import {
  productionStatusLabel,
  productionStatusTone,
} from "@/entities/admin/lib/production-status";
import {
  useShopifyVariantImages,
  variantNumericId,
} from "@/hooks/useShopifyVariantImages";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { useUserOrders } from "../useUserOrders";

/**
 * Estado de producción del pedido: el mismo criterio que la lista de
 * `/admin/orders` — un único badge, y "mixed" cuando los items difieren, en vez
 * de una fila de badges repetidos.
 */
function orderStatus(items: AdminUserOrderListItem["items"]): string {
  if (!items.length) return "draft";
  const statuses = [...new Set(items.map((i) => i.productionStatus))];
  return statuses.length === 1 ? statuses[0] : "mixed";
}

/**
 * Imagen del producto de Shopify comprado: variante live de Shopify → imagen
 * primaria del estilo (catálogo). Mismo orden que la card del detalle de pedido,
 * y como allí no cae al arte del cliente: aquí interesa qué se compró.
 */
function productImage(
  item: AdminUserOrderItem | undefined,
  variantImages: Record<string, string>,
): string | null {
  if (!item) return null;
  const numericId = variantNumericId(item.shopifyVariantId);
  return (
    (numericId ? variantImages[numericId] : null) ??
    item.productRef?.style?.images?.[0]?.imageUrl ??
    null
  );
}

/** Pestaña "Pedidos": pedidos del usuario, cada fila enlaza a su detalle. */
export function UserOrdersPanel({ userId }: { userId: string }) {
  const router = useRouter();
  const { orders, loading, page, setPage } = useUserOrders(userId);
  // Best-effort: imagen live de Shopify de cada handle de la página, indexada
  // por id numérico de variante (mismo hook que el detalle de pedido).
  const variantImages = useShopifyVariantImages(
    (orders?.data ?? []).flatMap((o) =>
      o.items.map((i) => i.productRef?.shopifyHandle),
    ),
  );

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
    <BlockStack gap="400">
      <Text variant="headingSm" as="h3">
        Pedidos ({orders.meta.total})
      </Text>

      {/* Una sola card con filas separadas por divisor: la card por pedido
          anidaba bordes dentro de la card de las pestañas y rompía la lectura
          en columna. `ResourceList` da además hover y foco de teclado. */}
      <Card padding="0">
        <ResourceList
          resourceName={{ singular: "pedido", plural: "pedidos" }}
          items={orders.data}
          renderItem={(order) => (
            <OrderRow
              key={order.id}
              order={order}
              variantImages={variantImages}
              onOpen={() => router.push(`/admin/orders/${order.id}`)}
            />
          )}
        />
      </Card>

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

/**
 * Miniatura del pedido. Se usa un `<img>` propio en vez del `Thumbnail` de
 * Polaris porque este no expone `onError`, y las URLs guardadas pueden apuntar a
 * un 404 si la imagen se borró después (p. ej. un producto retirado de Shopify).
 * Con `Thumbnail` eso se ve como un recuadro blanco roto; así cae al mismo
 * placeholder que un pedido sin imagen.
 */
function OrderThumb({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  const box = {
    width: 40,
    height: 40,
    borderRadius: "var(--p-border-radius-200)",
    border: "1px solid var(--p-color-border)",
    background: "var(--p-color-bg-surface-secondary)",
    objectFit: "cover" as const,
    display: "block",
  };

  if (!url || failed) return <div style={box} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cloudinaryThumb(url, 120)}
      alt=""
      style={box}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function OrderRow({
  order,
  variantImages,
  onOpen,
}: {
  order: AdminUserOrderListItem;
  variantImages: Record<string, string>;
  onOpen: () => void;
}) {
  const thumb = productImage(order.items[0], variantImages);
  const status = orderStatus(order.items);
  const count = order.items.length;
  // Con un solo item su título dice más que el recuento; con varios, el
  // recuento evita una segunda línea inútil.
  const summary =
    count === 1 ? (order.items[0].title ?? "1 artículo") : `${count} artículos`;
  // El pago solo se destaca cuando no está cobrado: un "Pagado" verde en cada
  // fila sería ruido, un "Pendiente" es justo lo que hay que ver.
  const showPayment =
    Boolean(order.financialStatus) &&
    order.financialStatus?.toLowerCase() !== "paid";

  return (
    <ResourceItem
      id={order.id}
      onClick={onOpen}
      accessibilityLabel={`Ver pedido ${order.orderNumber}`}
      media={<OrderThumb url={thumb} />}
      verticalAlignment="center"
    >
      <InlineStack
        align="space-between"
        blockAlign="center"
        gap="400"
        wrap={false}
      >
        <BlockStack gap="050">
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {order.orderNumber}
          </Text>
          <Text variant="bodySm" tone="subdued" as="span" truncate>
            {fmtShortDate(order.shopifyCreatedAt)} · {summary}
          </Text>
        </BlockStack>

        <BlockStack gap="100" inlineAlign="end">
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {fmtCurrency(order.totalAmount, order.currency)}
          </Text>
          <InlineStack gap="100" align="end" wrap={false}>
            {showPayment && (
              <Badge size="small" tone={financialTone(order.financialStatus)}>
                {financialLabel(order.financialStatus)}
              </Badge>
            )}
            <Badge size="small" tone={productionStatusTone(status)}>
              {productionStatusLabel(status)}
            </Badge>
          </InlineStack>
        </BlockStack>
      </InlineStack>
    </ResourceItem>
  );
}
