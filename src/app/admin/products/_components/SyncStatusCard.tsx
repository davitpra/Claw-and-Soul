"use client";

import type { ReactNode } from "react";
import { Card, Badge, Text, InlineStack, BlockStack } from "@shopify/polaris";
import { SyncStatus } from "@/entities/admin/api";
import { syncStatusTone } from "@/entities/admin/lib/sync-status";

/** Par "etiqueta tenue + valor" de la fila de métricas. */
function SyncStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <BlockStack gap="100">
      <Text variant="bodySm" tone="subdued" as="span">
        {label}
      </Text>
      {children}
    </BlockStack>
  );
}

function StatValue({
  tone,
  children,
}: {
  tone?: "success";
  children: ReactNode;
}) {
  return (
    <Text variant="bodyMd" fontWeight="semibold" tone={tone} as="span">
      {children}
    </Text>
  );
}

/** Resumen de la última sincronización de productos con Shopify. */
export function SyncStatusCard({ syncStatus }: { syncStatus: SyncStatus }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingSm" as="h2">
          Estado de sincronización
        </Text>
        <InlineStack gap="600" wrap>
          <SyncStat label="Último estado">
            <Badge tone={syncStatusTone(syncStatus.status)}>
              {syncStatus.status}
            </Badge>
          </SyncStat>

          {syncStatus.startedAt && (
            <SyncStat label="Iniciado">
              <StatValue>
                {new Date(syncStatus.startedAt).toLocaleString("es-ES")}
              </StatValue>
            </SyncStat>
          )}

          {syncStatus.productsChecked != null && (
            <SyncStat label="Revisados">
              <StatValue>{syncStatus.productsChecked}</StatValue>
            </SyncStat>
          )}

          {syncStatus.productsCreated != null && (
            <SyncStat label="Creados">
              <StatValue tone="success">{syncStatus.productsCreated}</StatValue>
            </SyncStat>
          )}

          {syncStatus.productsUpdated != null && (
            <SyncStat label="Actualizados">
              <StatValue>{syncStatus.productsUpdated}</StatValue>
            </SyncStat>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
