"use client";

import { ReactNode } from "react";
import { Badge, Text, InlineStack, BlockStack } from "@shopify/polaris";
import { AdminOrderItem } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { ItemMediaRow } from "./ItemMediaRow";

type ItemProductSummaryRowProps = {
  item: AdminOrderItem;
  image: string | null;
  currency: string;
  // Contenido extra bajo el SKU (ej. el badge y los créditos de un pack).
  children?: ReactNode;
};

// Fila "producto de Shopify" del item: miniatura + nombre del producto, variante,
// SKU y precio. La comparten la card de arte y la card simple de accesorios/créditos.
export function ItemProductSummaryRow({
  item,
  image,
  currency,
  children,
}: ItemProductSummaryRowProps) {
  return (
    <ItemMediaRow
      image={image}
      alt={item.productRef?.displayName ?? item.title}
    >
      <InlineStack
        align="space-between"
        blockAlign="center"
        gap="400"
        wrap={false}
      >
        <BlockStack gap="050">
          <Text variant="bodySm" tone="subdued" as="span">
            Producto de Shopify
          </Text>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {item.productRef?.displayName ??
              item.productRef?.name ??
              item.title}
          </Text>
          {item.productVariant?.shopifyVariantTitle && (
            <Text variant="bodySm" tone="subdued" as="span">
              {item.productVariant.shopifyVariantTitle}
            </Text>
          )}
          {item.sku && (
            <Text variant="bodySm" tone="subdued" as="span">
              SKU: {item.sku}
            </Text>
          )}
          {children}
        </BlockStack>
        <InlineStack gap="400" blockAlign="center" wrap={false}>
          <InlineStack gap="150" blockAlign="center" wrap={false}>
            <Text variant="bodyMd" tone="subdued" as="span">
              {fmtCurrency(item.unitPrice, currency)} ×
            </Text>
            <Badge>{String(item.quantity)}</Badge>
          </InlineStack>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {fmtCurrency(item.totalPrice, currency)}
          </Text>
        </InlineStack>
      </InlineStack>
    </ItemMediaRow>
  );
}
