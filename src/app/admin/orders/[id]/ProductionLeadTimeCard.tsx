"use client";

import { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Banner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { adminApi, AdminOrderDetail } from "@/entities/admin/api";
import { fmtShortDate } from "@/entities/admin/lib/order-format";

type LeadTimeResult = {
  leadTime: number | null;
  label: string | null;
  estimatedReadyAt: string | null;
};

type ProductionLeadTimeCardProps = {
  order: AdminOrderDetail;
  orderId: string;
};

export function ProductionLeadTimeCard({
  order,
  orderId,
}: ProductionLeadTimeCardProps) {
  const podItems = order.items.filter((i) => i.fulfillmentMethod === "pod");

  // Pre-populate from DB values already saved on each item
  const [results, setResults] = useState<Record<string, LeadTimeResult | null>>(
    () =>
      Object.fromEntries(
        podItems
          .filter((i) => i.podLeadTimeDays != null)
          .map((i) => [
            i.id,
            {
              leadTime: i.podLeadTimeDays,
              label:
                i.podLeadTimeDays != null
                  ? `${i.podLeadTimeDays} días hábiles`
                  : null,
              estimatedReadyAt: i.podEstimatedReadyAt,
            },
          ]),
      ),
  );
  const [loadingItem, setLoadingItem] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  if (podItems.length === 0) return null;

  async function handleConsult(itemId: string) {
    setLoadingItem((prev) => ({ ...prev, [itemId]: true }));
    setErrors((prev) => ({ ...prev, [itemId]: null }));
    try {
      const res = await adminApi.orders.podLeadTime(orderId, itemId);
      setResults((prev) => ({
        ...prev,
        [itemId]: {
          leadTime: res.leadTime,
          label: res.label,
          estimatedReadyAt: res.estimatedReadyAt,
        },
      }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [itemId]: (e as Error).message }));
    } finally {
      setLoadingItem((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Lead time de producción
        </Text>
        {podItems.map((item, i) => {
          const result = results[item.id];
          const err = errors[item.id];
          return (
            <div key={item.id}>
              {i > 0 && <Divider />}
              <Box paddingBlock="200">
                <BlockStack gap="100">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="0">
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {item.title}
                      </Text>
                      {(item.size || item.style) && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          {[item.size, item.style].filter(Boolean).join(" · ")}
                        </Text>
                      )}
                    </BlockStack>
                    <InlineStack gap="200" blockAlign="center">
                      {result?.leadTime != null && (
                        <Badge tone="info">
                          {result.label ?? `${result.leadTime} días hábiles`}
                        </Badge>
                      )}
                      <Button
                        size="slim"
                        variant={result ? "plain" : "secondary"}
                        loading={loadingItem[item.id]}
                        onClick={() => handleConsult(item.id)}
                      >
                        {result ? "Actualizar" : "Consultar"}
                      </Button>
                    </InlineStack>
                  </InlineStack>
                  {result?.estimatedReadyAt && (
                    <Text variant="bodySm" tone="subdued" as="span">
                      Listo aprox.:{" "}
                      <strong>{fmtShortDate(result.estimatedReadyAt)}</strong>
                    </Text>
                  )}
                  {err && (
                    <Banner
                      tone="critical"
                      onDismiss={() =>
                        setErrors((prev) => ({ ...prev, [item.id]: null }))
                      }
                    >
                      {err}
                    </Banner>
                  )}
                </BlockStack>
              </Box>
            </div>
          );
        })}
      </BlockStack>
    </Card>
  );
}
