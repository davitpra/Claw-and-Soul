"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Modal,
  Select,
  Thumbnail,
} from "@shopify/polaris";
import { RefreshIcon, DeleteIcon, ImageIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminProduct,
  AdminStyle,
  SyncStatus,
} from "@/entities/admin/api";
import { shopifyFetch } from "@/lib/shopify/client";

const GET_PRODUCTS_IMAGES = `
  query getProductsImages($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          images(first: 1) {
            edges {
              node { url }
            }
          }
        }
      }
    }
  }
`;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<AdminProduct | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [savingStyle, setSavingStyle] = useState<string | null>(null);
  const [savingFulfillment, setSavingFulfillment] = useState<string | null>(
    null,
  );
  const [savingTemplate, setSavingTemplate] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  const loadProducts = () => {
    setLoading(true);
    adminApi.products
      .list()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const loadSyncStatus = () => {
    adminApi.sync
      .status()
      .then(setSyncStatus)
      .catch(() => {});
  };

  const loadStyles = () => {
    adminApi.styles
      .list()
      .then((all) => setStyles(all.filter((s) => s.isActive)))
      .catch(() => {});
  };

  const loadImages = async () => {
    try {
      const { data } = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              handle: string;
              images: { edges: Array<{ node: { url: string } }> };
            };
          }>;
        };
      }>({ query: GET_PRODUCTS_IMAGES, variables: { first: 250 } });

      const map: Record<string, string> = {};
      for (const { node } of data.products.edges) {
        const url = node.images.edges[0]?.node.url;
        if (url) map[node.handle] = url;
      }
      setImageMap(map);
    } catch {
      // imágenes best-effort — no bloquear la UI si falla
    }
  };

  useEffect(() => {
    loadProducts();
    loadSyncStatus();
    loadStyles();
    loadImages();
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

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await adminApi.products.delete(deletingTarget.id);
      setDeletingTarget(null);
      loadProducts();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFulfillmentChange = async (productId: string, value: string) => {
    const fulfillmentMethod = value as "in_house" | "pod";
    setSavingFulfillment(productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, fulfillmentMethod } : p)),
    );
    try {
      await adminApi.products.update(productId, { fulfillmentMethod });
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingFulfillment(null);
    }
  };

  const handleTemplateChange = async (productId: string, value: string) => {
    const template = value || null;
    setSavingTemplate(productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, template } : p)),
    );
    try {
      await adminApi.products.update(productId, { template });
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingTemplate(null);
    }
  };

  const handleStyleChange = async (productId: string, newStyleId: string) => {
    setSavingStyle(productId);
    const styleId = newStyleId || null;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              styleId,
              style: styleId
                ? (() => {
                    const s = styles.find((x) => x.id === styleId);
                    return s
                      ? {
                          id: s.id,
                          name: s.name,
                          displayName: s.displayName,
                          previewUrl: s.previewUrl,
                        }
                      : null;
                  })()
                : null,
            }
          : p,
      ),
    );
    try {
      await adminApi.products.update(productId, { styleId });
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingStyle(null);
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
      title="Productos"
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
              headings={[
                { title: "Producto" },
                { title: "Estilo asignado" },
                { title: "Fulfillment" },
                { title: "Template" },
                { title: "Estado" },
                { title: "Acciones" },
              ]}
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
                    <InlineStack gap="300" blockAlign="center">
                      <Thumbnail
                        source={
                          (p.shopifyHandle && imageMap[p.shopifyHandle]) ||
                          ImageIcon
                        }
                        alt={p.displayName}
                        size="small"
                      />
                      <BlockStack gap="0">
                        <Text variant="bodyMd" fontWeight="semibold" as="span">
                          {p.displayName}
                        </Text>
                        <Text variant="bodySm" tone="subdued" as="span">
                          {p.name}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{ minWidth: 180 }}>
                        <Select
                          label=""
                          labelHidden
                          disabled={savingStyle === p.id}
                          value={p.styleId ?? ""}
                          onChange={(value) => handleStyleChange(p.id, value)}
                          options={[
                            { label: "Sin asignar", value: "" },
                            ...styles.map((s) => ({
                              label: s.displayName,
                              value: s.id,
                            })),
                          ]}
                        />
                      </div>
                      {savingStyle === p.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{ minWidth: 170 }}>
                        <Select
                          label=""
                          labelHidden
                          disabled={savingFulfillment === p.id}
                          value={p.fulfillmentMethod ?? "in_house"}
                          onChange={(value) =>
                            handleFulfillmentChange(p.id, value)
                          }
                          options={[
                            { label: "Taller (in-house)", value: "in_house" },
                            { label: "POD (externo)", value: "pod" },
                          ]}
                        />
                      </div>
                      {savingFulfillment === p.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{ minWidth: 150 }}>
                        <Select
                          label=""
                          labelHidden
                          disabled={savingTemplate === p.id}
                          value={p.template ?? ""}
                          onChange={(value) =>
                            handleTemplateChange(p.id, value)
                          }
                          options={[
                            { label: "Por defecto", value: "" },
                            { label: "Canvas", value: "Canvas" },
                            { label: "Poster", value: "Poster" },
                          ]}
                        />
                      </div>
                      {savingTemplate === p.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        type="button"
                        onClick={() => handleToggle(p)}
                        disabled={toggling === p.id}
                        aria-label={
                          p.isActive
                            ? "Desactivar producto"
                            : "Activar producto"
                        }
                        title={
                          p.isActive
                            ? "Click para desactivar"
                            : "Click para activar"
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: toggling === p.id ? "wait" : "pointer",
                          opacity: toggling === p.id ? 0.6 : 1,
                        }}
                      >
                        <Badge tone={p.isActive ? "success" : "enabled"}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                      {toggling === p.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <Link href={`/admin/products/${p.id}`}>
                        <Button variant="plain" size="slim">
                          Ver
                        </Button>
                      </Link>
                      <Button
                        variant="plain"
                        tone="critical"
                        size="slim"
                        icon={DeleteIcon}
                        accessibilityLabel={`Eliminar ${p.displayName}`}
                        onClick={() => setDeletingTarget(p)}
                      />
                    </InlineStack>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        )}
      </BlockStack>

      <Modal
        open={deletingTarget !== null}
        onClose={() => {
          if (!deleting) setDeletingTarget(null);
        }}
        title="¿Eliminar producto permanentemente?"
        primaryAction={{
          content: "Eliminar",
          destructive: true,
          loading: deleting,
          onAction: handleDelete,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            onAction: () => setDeletingTarget(null),
            disabled: deleting,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">
              Se eliminará{" "}
              <Text as="span" fontWeight="semibold">
                {deletingTarget?.displayName}
              </Text>{" "}
              y todas sus variantes vinculadas.
            </Text>
            <Text as="p" tone="subdued">
              Las generaciones y pedidos existentes se conservan sin referencia
              al producto. Esta acción no se puede deshacer.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
