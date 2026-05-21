"use client";

import { useEffect, useState } from "react";
import {
  Page,
  Card,
  IndexTable,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Icon,

} from "@shopify/polaris";
import { RefreshIcon, AlertTriangleIcon } from "@shopify/polaris-icons";
import { adminApi, AdminProduct, SyncStatus } from "@/entities/admin/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    adminApi.products
      .list()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const loadSyncStatus = () => {
    adminApi.sync.status().then(setSyncStatus).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    loadSyncStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await adminApi.sync.trigger();
      await new Promise((r) => setTimeout(r, 1500));
      loadSyncStatus();
      loadProducts();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggle = async (p: AdminProduct) => {
    setToggling(p.id);
    try {
      if (p.isActive) {
        await adminApi.products.deactivate(p.id);
      } else {
        await adminApi.products.update(p.id, { isActive: true });
      }
      loadProducts();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  const syncTone =
    syncStatus?.status === "completed"
      ? "success"
      : syncStatus?.status === "failed"
      ? "critical"
      : "attention";

  return (
    <Page
      title="Productos & Sync"
      subtitle="Productos sincronizados desde Shopify"
      primaryAction={{
        content: "Sincronizar Shopify",
        icon: RefreshIcon,
        loading: syncing,
        onAction: handleSync,
      }}
    >
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {syncStatus && (
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Estado de sincronización
              </Text>
              <InlineStack gap="600" wrap>
                <BlockStack gap="100">
                  <Text variant="bodySm" tone="subdued" as="span">
                    Último estado
                  </Text>
                  <Badge tone={syncTone}>{syncStatus.status}</Badge>
                </BlockStack>
                {syncStatus.startedAt && (
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Iniciado
                    </Text>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {new Date(syncStatus.startedAt).toLocaleString("es-ES")}
                    </Text>
                  </BlockStack>
                )}
                {syncStatus.productsChecked != null && (
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Revisados
                    </Text>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {syncStatus.productsChecked}
                    </Text>
                  </BlockStack>
                )}
                {syncStatus.productsCreated != null && (
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Creados
                    </Text>
                    <Text
                      variant="bodyMd"
                      fontWeight="semibold"
                      tone="success"
                      as="span"
                    >
                      {syncStatus.productsCreated}
                    </Text>
                  </BlockStack>
                )}
                {syncStatus.productsUpdated != null && (
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Actualizados
                    </Text>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {syncStatus.productsUpdated}
                    </Text>
                  </BlockStack>
                )}
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {loading ? (
          <Card>
            <InlineStack align="center" gap="300">
              <Spinner size="small" />
              <Text as="span" tone="subdued">
                Cargando productos…
              </Text>
            </InlineStack>
          </Card>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "producto", plural: "productos" }}
              itemCount={products.length}
              headings={[{ title: "Producto" }, { title: "Handle Shopify" }, { title: "Estilo asignado" }, { title: "Tipo" }, { title: "Estado" }, { title: "Acción" }]}
              selectable={false}
            >
              {products.map((p, index) => (
                <IndexTable.Row
                  id={p.id}
                  key={p.id}
                  position={index}
                  tone={p.isActive ? undefined : "subdued"}
                >
                  <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {p.displayName}
                    </Text>
                    <br />
                    <Text variant="bodySm" tone="subdued" as="span">
                      {p.name}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text
                      variant="bodySm"
                      tone="subdued"
                      as="span"
                    >
                      {p.shopifyHandle ?? "—"}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {p.style ? (
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {p.style.displayName}
                      </Text>
                    ) : (
                      <InlineStack gap="100" blockAlign="center">
                        <Icon source={AlertTriangleIcon} tone="caution" />
                        <Text variant="bodySm" tone="caution" as="span">
                          Sin asignar
                        </Text>
                      </InlineStack>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {p.productType ?? "—"}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={p.isActive ? "success" : "enabled"}>
                      {p.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Button
                      variant="plain"
                      tone={p.isActive ? "critical" : undefined}
                      size="slim"
                      loading={toggling === p.id}
                      onClick={() => handleToggle(p)}
                    >
                      {p.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
