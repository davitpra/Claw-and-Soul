"use client";

import {
  Card,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { AdminOrderDetail } from "@/entities/admin/api";
import { productionStatusLabel } from "@/entities/admin/lib/production-status";
import { OrderItemKind } from "@/entities/admin/lib/order-item-kind";
import { fmtDate } from "@/entities/admin/lib/order-format";

type OrderEventsCardProps = {
  events: AdminOrderDetail["events"];
  // Tipo de cada item del pedido: los accesorios renombran algún estado, así que
  // el historial se etiqueta con el tipo del item que cambió.
  kindByItemId: Record<string, OrderItemKind>;
};

export function OrderEventsCard({
  events,
  kindByItemId,
}: OrderEventsCardProps) {
  if (events.length === 0) return null;

  const labelFor = (status: string, orderItemId: string | null) =>
    productionStatusLabel(
      status,
      (orderItemId && kindByItemId[orderItemId]) || "art",
    );

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Historial de eventos
        </Text>
        {events.map((ev, i) => (
          <div key={ev.id}>
            {i > 0 && <Divider />}
            <Box paddingBlock="200">
              <InlineStack gap="300" blockAlign="start">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#448da6",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <BlockStack gap="0">
                  <Text variant="bodyMd" as="span">
                    <strong>{ev.eventType.replace(/_/g, " ")}</strong>
                    {ev.fromStatus && ev.toStatus && (
                      <Text as="span" tone="subdued">
                        {" "}
                        · {labelFor(ev.fromStatus, ev.orderItemId)} →{" "}
                        {labelFor(ev.toStatus, ev.orderItemId)}
                      </Text>
                    )}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="span">
                    {fmtDate(ev.createdAt)} · {ev.source}
                  </Text>
                </BlockStack>
              </InlineStack>
            </Box>
          </div>
        ))}
      </BlockStack>
    </Card>
  );
}
