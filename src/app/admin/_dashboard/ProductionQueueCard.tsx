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
import { OverviewProduction } from "@/entities/admin/api";
import {
  productionStatusLabel,
  productionStatusTone,
} from "@/entities/admin/lib/production-status";
import { fmtAge, fmtCount } from "./format";

/** Orden del pipeline; el backend solo devuelve los estados de la cola. */
const QUEUE_ORDER = ["draft", "pre_production", "in_production", "printed"];

/**
 * La lista de trabajo del estudio. Es la única card que ignora el selector de
 * periodo: la cola es una foto del ahora, no un agregado de la ventana.
 */
export function ProductionQueueCard({
  production,
  periodLabel,
}: {
  production: OverviewProduction;
  periodLabel: string;
}) {
  const { queue, queueTotal, byMethod, oldestQueuedAt } = production;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Cola de producción
          </Text>
          <Text variant="headingLg" as="span">
            {fmtCount(queueTotal)}
          </Text>
        </InlineStack>

        {queueTotal === 0 ? (
          <Text as="p" tone="subdued">
            Nada pendiente de producir.
          </Text>
        ) : (
          <BlockStack gap="0">
            {QUEUE_ORDER.map((status, i) => (
              <div key={status}>
                {i > 0 && <Divider />}
                <Box paddingBlock="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Link
                      href={`/admin/orders?status=${status}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Badge tone={productionStatusTone(status)}>
                        {productionStatusLabel(status)}
                      </Badge>
                    </Link>
                    <Text as="span">{fmtCount(queue[status] ?? 0)}</Text>
                  </InlineStack>
                </Box>
              </div>
            ))}
          </BlockStack>
        )}

        <Divider />

        <BlockStack gap="100">
          <InlineStack align="space-between">
            <Text variant="bodySm" as="span" tone="subdued">
              Taller · POD
            </Text>
            <Text variant="bodySm" as="span">
              {fmtCount(byMethod.in_house)} · {fmtCount(byMethod.pod)}
            </Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text variant="bodySm" as="span" tone="subdued">
              Más antiguo en cola
            </Text>
            <Text variant="bodySm" as="span">
              {fmtAge(oldestQueuedAt)}
            </Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text variant="bodySm" as="span" tone="subdued">
              Enviados · entregados ({periodLabel})
            </Text>
            <Text variant="bodySm" as="span">
              {fmtCount(production.shipped)} · {fmtCount(production.delivered)}
            </Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
