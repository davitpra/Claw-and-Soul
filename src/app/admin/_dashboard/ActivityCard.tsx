"use client";

import Link from "next/link";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewStats } from "@/entities/admin/api";
import { productionStatusLabel } from "@/entities/admin/lib/production-status";
import { syncStatusTone } from "@/entities/admin/lib/sync-status";
import { fmtAge, fmtDateTime } from "./format";

const EVENT_LABELS: Record<string, string> = {
  status_change: "Cambio de estado",
  webhook_received: "Webhook",
  manual_resync: "Resincronización",
  pod_submit: "Envío a POD",
  pod_skip: "POD omitido",
  warning: "Aviso",
};

/**
 * Últimos movimientos de pedidos. La sincronización con Shopify va aquí como un
 * badge y no como card propia: solo importa cuando falla, y de eso ya avisa
 * `AlertsBanner`.
 */
export function ActivityCard({
  recentEvents,
  syncHealth,
}: {
  recentEvents: OverviewStats["recentEvents"];
  syncHealth: OverviewStats["syncHealth"];
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Actividad reciente
          </Text>
          {syncHealth.lastStatus && (
            <InlineStack gap="200" blockAlign="center">
              <Text variant="bodySm" as="span" tone="subdued">
                Sync {syncHealth.lastType} · {fmtAge(syncHealth.lastStartedAt)}
              </Text>
              <Badge tone={syncStatusTone(syncHealth.lastStatus)}>
                {syncHealth.lastStatus}
              </Badge>
            </InlineStack>
          )}
        </InlineStack>

        {recentEvents.length === 0 ? (
          <Text as="p" tone="subdued">
            Sin movimientos registrados.
          </Text>
        ) : (
          <BlockStack gap="0">
            {recentEvents.map((event, i) => (
              <div key={event.id}>
                {i > 0 && <Divider />}
                <Box paddingBlock="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="050">
                      <Link
                        href={`/admin/orders/${event.orderId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Text variant="bodyMd" as="span">
                          #{event.orderNumber}
                        </Text>
                      </Link>
                      <Text variant="bodySm" as="span" tone="subdued">
                        {describeEvent(event)}
                      </Text>
                    </BlockStack>
                    <Text variant="bodySm" as="span" tone="subdued">
                      {fmtDateTime(event.createdAt)}
                    </Text>
                  </InlineStack>
                </Box>
              </div>
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}

/** `Borrador → En producción` cuando hay transición; si no, el tipo de evento. */
function describeEvent(event: OverviewStats["recentEvents"][number]): string {
  const label = EVENT_LABELS[event.eventType] ?? event.eventType;

  if (event.eventType === "status_change" && event.toStatus) {
    const from = event.fromStatus
      ? `${productionStatusLabel(event.fromStatus)} → `
      : "";
    return `${from}${productionStatusLabel(event.toStatus)}`;
  }

  return `${label} · ${event.source}`;
}
