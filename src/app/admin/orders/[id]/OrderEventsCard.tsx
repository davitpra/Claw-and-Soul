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
import { PRODUCTION_STATUS_LABELS } from "@/entities/admin/lib/production-status";
import { fmtDate } from "@/entities/admin/lib/order-format";

type OrderEventsCardProps = {
  events: AdminOrderDetail["events"];
};

export function OrderEventsCard({ events }: OrderEventsCardProps) {
  if (events.length === 0) return null;

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
                        ·{" "}
                        {PRODUCTION_STATUS_LABELS[ev.fromStatus] ??
                          ev.fromStatus}{" "}
                        →{" "}
                        {PRODUCTION_STATUS_LABELS[ev.toStatus] ?? ev.toStatus}
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
