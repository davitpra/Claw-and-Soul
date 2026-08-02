"use client";

import { useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { adminApi, AdminOrderItem } from "@/entities/admin/api";
import { transitionsFor } from "@/entities/admin/lib/order-transitions";
import { OrderItemKind } from "@/entities/admin/lib/order-item-kind";
import { ItemFulfillmentControl } from "./ItemFulfillmentControl";
import { ItemProductSummaryRow } from "./ItemProductSummaryRow";
import { ItemStatusSelect } from "./ItemStatusSelect";

type SimpleOrderItemCardProps = {
  item: AdminOrderItem;
  kind: Exclude<OrderItemKind, "art">;
  orderId: string;
  currency: string;
  shopifyImageUrl?: string | null;
  onUpdate: () => void;
  onRequestCancel: (itemIds: string[]) => void;
};

// Card de los items que no llevan arte: accesorios (kit, pinceles) y packs de
// créditos. No tienen generación ni imagen para impresión, así que se muestran
// como una sola fila de producto en vez de la card completa de `OrderItemCard`.
export function SimpleOrderItemCard({
  item,
  kind,
  orderId,
  currency,
  shopifyImageUrl,
  onUpdate,
  onRequestCancel,
}: SimpleOrderItemCardProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "in_house" | "pod"
  >(item.fulfillmentMethod as "in_house" | "pod");
  const [savingFulfillment, setSavingFulfillment] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Imagen live de la variante comprada → imagen del estilo → miniatura persistida.
  // Mismo orden que `resolveItemImage` del dashboard de usuario.
  const image =
    shopifyImageUrl ??
    item.productRef?.style?.images?.[0]?.imageUrl ??
    item.imageUrl ??
    null;

  // Los créditos no se producen ni se envían: la card queda sin controles.
  const isCredits = kind === "credits";
  const allowed = isCredits ? [] : transitionsFor(item.productionStatus, kind);

  async function handleFulfillmentChange(value: string) {
    const method = value as "in_house" | "pod";
    setFulfillmentMethod(method);
    setSavingFulfillment(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemFulfillment(orderId, item.id, method);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
      setFulfillmentMethod(item.fulfillmentMethod as "in_house" | "pod");
    } finally {
      setSavingFulfillment(false);
    }
  }

  async function handleStatusSelect(value: string) {
    if (value === "cancelled") {
      onRequestCancel([item.id]);
      return;
    }
    setUpdatingStatus(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemStatus(orderId, item.id, value);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <>
      {!isCredits && (
        <ItemFulfillmentControl
          value={fulfillmentMethod}
          disabled={savingFulfillment}
          onChange={handleFulfillmentChange}
          productionStatus={item.productionStatus}
          kind={kind}
        />
      )}

      <Card>
        <BlockStack gap="300">
          <ItemProductSummaryRow item={item} image={image} currency={currency}>
            {isCredits && (
              <InlineStack gap="150" blockAlign="center">
                <Badge tone="info">Créditos</Badge>
                {item.creditAmount !== null && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    {item.creditAmount * item.quantity} créditos abonados
                  </Text>
                )}
              </InlineStack>
            )}
          </ItemProductSummaryRow>

          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}

          {allowed.length > 0 && (
            <>
              <Divider />
              <ItemStatusSelect
                allowed={allowed}
                disabled={updatingStatus}
                onSelect={handleStatusSelect}
                kind={kind}
              />
            </>
          )}
        </BlockStack>
      </Card>
    </>
  );
}
