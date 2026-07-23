"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Card,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Modal,
  Select,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminProduct,
  AdminStyle,
  SyncStatus,
} from "@/entities/admin/api";
import { shopifyFetch } from "@/lib/shopify/client";
import { SelectedProductTable } from "./_components/SelectedProductTable";
import {
  ProductsTable,
  ACCESSORY_TEMPLATE,
  resolveTemplate,
} from "./_components/ProductsTable";

const GET_PRODUCTS_META = `
  query getProductsMeta($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          productType
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
  const router = useRouter();
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
  const [savingArtKind, setSavingArtKind] = useState<string | null>(null);
  const [savingPbn, setSavingPbn] = useState(false);
  const [savingCreditPack, setSavingCreditPack] = useState(false);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [productTypeMap, setProductTypeMap] = useState<Record<string, string>>(
    {},
  );

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

  const loadShopifyMeta = async () => {
    try {
      const { data } = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              handle: string;
              productType: string | null;
              images: { edges: Array<{ node: { url: string } }> };
            };
          }>;
        };
      }>({ query: GET_PRODUCTS_META, variables: { first: 250 } });

      const images: Record<string, string> = {};
      const types: Record<string, string> = {};
      for (const { node } of data.products.edges) {
        const url = node.images.edges[0]?.node.url;
        if (url) images[node.handle] = url;
        const type = node.productType?.trim();
        if (type) types[node.handle] = type;
      }
      setImageMap(images);
      setProductTypeMap(types);
    } catch {
      // metadatos de Shopify best-effort — no bloquear la UI si falla
    }
  };

  useEffect(() => {
    loadProducts();
    loadSyncStatus();
    loadStyles();
    loadShopifyMeta();
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

  const handleArtKindChange = async (productId: string, value: string) => {
    const artKind = value || null;
    setSavingArtKind(productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, artKind } : p)),
    );
    try {
      await adminApi.products.update(productId, { artKind });
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingArtKind(null);
    }
  };

  const handlePbnChange = async (productId: string) => {
    const target = productId || null;
    setSavingPbn(true);
    setProducts((prev) =>
      prev.map((p) => ({ ...p, isPaintByNumbers: p.id === target })),
    );
    try {
      await adminApi.products.setPbn(target);
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingPbn(false);
    }
  };

  const handleCreditPackChange = async (productId: string) => {
    const target = productId || null;
    setSavingCreditPack(true);
    setProducts((prev) =>
      prev.map((p) => ({ ...p, isCreditPack: p.id === target })),
    );
    try {
      await adminApi.products.setCreditPack(target);
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    } finally {
      setSavingCreditPack(false);
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

  const pbnProduct = products.find((p) => p.isPaintByNumbers) ?? null;
  const creditPackProduct = products.find((p) => p.isCreditPack) ?? null;
  // Los productos asignados a un rol especial se muestran en su card y se
  // excluyen de la tabla principal para no duplicarlos.
  const specialIds = new Set(
    [pbnProduct?.id, creditPackProduct?.id].filter(Boolean),
  );
  const listProducts = products.filter((p) => !specialIds.has(p.id));
  // Un producto es accesorio cuando su template es "Accessory". El resto son
  // productos asignables a un estilo.
  const accessoryProducts = listProducts.filter(
    (p) => resolveTemplate(p, productTypeMap) === ACCESSORY_TEMPLATE,
  );
  const styleProducts = listProducts.filter(
    (p) => resolveTemplate(p, productTypeMap) !== ACCESSORY_TEMPLATE,
  );

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

        {!loading && (
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Producto Paint by Numbers
              </Text>
              <InlineStack gap="200" blockAlign="center">
                <div style={{ minWidth: 260 }}>
                  <Select
                    label="Kit dedicado al comprar un PBN guardado"
                    disabled={savingPbn}
                    value={products.find((p) => p.isPaintByNumbers)?.id ?? ""}
                    onChange={handlePbnChange}
                    helpText="Solo puede haber uno. Elegir otro reemplaza al anterior automáticamente."
                    options={[
                      { label: "Sin asignar", value: "" },
                      ...products
                        .filter((p) => p.isActive)
                        .map((p) => ({ label: p.displayName, value: p.id })),
                    ]}
                  />
                </div>
                {savingPbn && <Spinner size="small" />}
              </InlineStack>
              {pbnProduct && (
                <SelectedProductTable
                  product={pbnProduct}
                  imageMap={imageMap}
                  onRowClick={(id) => router.push(`/admin/products/${id}`)}
                />
              )}
            </BlockStack>
          </Card>
        )}

        {!loading && (
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Producto Credit Pack
              </Text>
              <InlineStack gap="200" blockAlign="center">
                <div style={{ minWidth: 260 }}>
                  <Select
                    label="Producto dedicado a la venta de créditos"
                    disabled={savingCreditPack}
                    value={products.find((p) => p.isCreditPack)?.id ?? ""}
                    onChange={handleCreditPackChange}
                    helpText="Solo puede haber uno. Configura los créditos por variante en la página del producto."
                    options={[
                      { label: "Sin asignar", value: "" },
                      ...products
                        .filter((p) => p.isActive)
                        .map((p) => ({ label: p.displayName, value: p.id })),
                    ]}
                  />
                </div>
                {savingCreditPack && <Spinner size="small" />}
              </InlineStack>
              {creditPackProduct && (
                <SelectedProductTable
                  product={creditPackProduct}
                  imageMap={imageMap}
                  onRowClick={(id) => router.push(`/admin/products/${id}`)}
                />
              )}
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
          <>
            <Card padding="0">
              <div style={{ padding: "var(--p-space-400)" }}>
                <Text variant="headingSm" as="h2">
                  Productos
                </Text>
              </div>
              <ProductsTable
                products={styleProducts}
                styles={styles}
                imageMap={imageMap}
                productTypeMap={productTypeMap}
                showStyleColumn
                savingStyle={savingStyle}
                savingFulfillment={savingFulfillment}
                savingTemplate={savingTemplate}
                savingArtKind={savingArtKind}
                toggling={toggling}
                onRowClick={(id) => router.push(`/admin/products/${id}`)}
                onStyleChange={handleStyleChange}
                onFulfillmentChange={handleFulfillmentChange}
                onTemplateChange={handleTemplateChange}
                onArtKindChange={handleArtKindChange}
                onToggleActive={handleToggle}
                onDelete={setDeletingTarget}
              />
            </Card>

            <Card padding="0">
              <div style={{ padding: "var(--p-space-400)" }}>
                <Text variant="headingSm" as="h2">
                  Accesorios
                </Text>
              </div>
              <ProductsTable
                products={accessoryProducts}
                styles={styles}
                imageMap={imageMap}
                productTypeMap={productTypeMap}
                savingStyle={savingStyle}
                savingFulfillment={savingFulfillment}
                savingTemplate={savingTemplate}
                savingArtKind={savingArtKind}
                toggling={toggling}
                onRowClick={(id) => router.push(`/admin/products/${id}`)}
                onStyleChange={handleStyleChange}
                onFulfillmentChange={handleFulfillmentChange}
                onTemplateChange={handleTemplateChange}
                onArtKindChange={handleArtKindChange}
                onToggleActive={handleToggle}
                onDelete={setDeletingTarget}
              />
            </Card>
          </>
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
