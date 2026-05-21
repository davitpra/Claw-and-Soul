"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
  Thumbnail,
  Select,
  Modal,
  IndexTable,
} from "@shopify/polaris";
import { ExternalIcon, DeleteIcon, RefreshIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminProduct,
  AdminStyle,
  AdminFormat,
  AdminProductVariants,
  AdminProductUnlinkedVariant,
} from "@/entities/admin/api";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [variants, setVariants] = useState<AdminProductVariants | null>(null);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});
  const [linkingVariantId, setLinkingVariantId] = useState<string | null>(null);
  const [shopifyImages, setShopifyImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [syncingVariants, setSyncingVariants] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; skipped: number } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [styleId, setStyleId] = useState("");

  const loadShopifyImages = async (handle: string) => {
    try {
      const { data } = await shopifyFetch<{
        product: {
          images: { edges: Array<{ node: { url: string; altText: string } }> };
        } | null;
      }>({ query: GET_PRODUCT, variables: { handle } });
      const urls = data.product?.images.edges.map((e) => e.node.url) ?? [];
      setShopifyImages(urls);
    } catch {
      // best-effort
    }
  };

  const loadVariants = async (productId: string) => {
    setLoadingVariants(true);
    try {
      const v = await adminApi.products.getVariants(productId);
      setVariants(v);
    } catch {
      // best-effort
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    Promise.all([
      adminApi.products.getById(id),
      adminApi.styles.list(),
      adminApi.formats.list(),
    ])
      .then(([p, s, f]) => {
        setProduct(p);
        setStyles(s.filter((x) => x.isActive));
        setFormats(f.filter((x) => x.isActive));
        setStyleId(p.styleId ?? "");
        if (p.shopifyHandle) loadShopifyImages(p.shopifyHandle);
        loadVariants(p.id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await adminApi.products.update(product.id, {
        styleId: styleId || null,
      } as Partial<AdminProduct>);
      setProduct(updated);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLinkVariant = async (u: AdminProductUnlinkedVariant) => {
    const formatId = selectedFormat[u.shopifyVariantId];
    if (!formatId || !product) return;
    setLinkingVariantId(u.shopifyVariantId);
    try {
      await adminApi.products.linkVariant(product.id, {
        shopifyVariantId: u.shopifyVariantId,
        shopifyVariantTitle: u.shopifyVariantTitle,
        formatId,
        shopifyVariantOption: u.shopifyVariantOption ?? undefined,
      });
      await loadVariants(product.id);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLinkingVariantId(null);
    }
  };

  const handleSyncVariants = async () => {
    if (!product) return;
    setSyncingVariants(true);
    setSyncResult(null);
    try {
      const result = await adminApi.products.syncVariants(product.id);
      setSyncResult(result);
      await loadVariants(product.id);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSyncingVariants(false);
    }
  };

  const handleToggle = async () => {
    if (!product) return;
    setToggling(true);
    try {
      if (product.isActive) {
        await adminApi.products.deactivate(product.id);
      } else {
        await adminApi.products.update(product.id, {
          isActive: true,
        } as Partial<AdminProduct>);
      }
      const updated = await adminApi.products.getById(product.id);
      setProduct(updated);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await adminApi.products.delete(product.id);
      router.replace("/admin/products");
    } catch (e: unknown) {
      setError((e as Error).message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <Page
        backAction={{ url: "/admin/products", content: "Productos" }}
        title="Cargando…"
      >
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner />
            <Text as="span" tone="subdued">
              Cargando producto…
            </Text>
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (error || !product) {
    return (
      <Page
        backAction={{ url: "/admin/products", content: "Productos" }}
        title="Producto"
      >
        <Banner tone="critical">{error ?? "Producto no encontrado."}</Banner>
      </Page>
    );
  }

  const assignedStyle = styles.find((s) => s.id === styleId);

  return (
    <Page
      backAction={{ url: "/admin/products", content: "Productos" }}
      title={product.displayName}
      subtitle={product.name}
      titleMetadata={
        <Badge tone={product.isActive ? "success" : "enabled"}>
          {product.isActive ? "Activo" : "Inactivo"}
        </Badge>
      }
      secondaryActions={[
        {
          content: product.isActive ? "Desactivar" : "Activar",
          loading: toggling,
          onAction: handleToggle,
        },
        ...(product.shopifyHandle
          ? [
              {
                content: "Ver en Shopify",
                icon: ExternalIcon,
                url: `https://admin.shopify.com/store/clawandsoul/products/${product.shopifyProductId}`,
                external: true,
              },
            ]
          : []),
        {
          content: "Resincronizar variantes",
          icon: RefreshIcon,
          loading: syncingVariants,
          onAction: handleSyncVariants,
        },
        {
          content: "Recargar variantes",
          icon: RefreshIcon,
          loading: loadingVariants,
          onAction: () => loadVariants(product.id),
        },
        {
          content: "Eliminar",
          icon: DeleteIcon,
          destructive: true,
          onAction: () => setDeleteOpen(true),
        },
      ]}
    >
      <Layout>
        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h2">
                Detalles
              </Text>
              <Select
                label="Estilo asignado"
                options={[
                  { label: "Sin asignar", value: "" },
                  ...styles.map((s) => ({
                    label: s.displayName,
                    value: s.id,
                  })),
                ]}
                value={styleId}
                onChange={setStyleId}
              />
              {assignedStyle?.previewUrl && (
                <InlineStack gap="200" blockAlign="center">
                  <Thumbnail
                    source={assignedStyle.previewUrl}
                    alt={assignedStyle.displayName}
                    size="small"
                  />
                  <Text variant="bodySm" tone="subdued" as="span">
                    Vista previa del estilo
                  </Text>
                </InlineStack>
              )}
              <InlineStack align="end">
                <Button variant="primary" loading={saving} onClick={handleSave}>
                  Guardar cambios
                </Button>
              </InlineStack>
              <Divider />
              <BlockStack gap="150">
                <Text variant="bodySm" tone="subdued" as="span">
                  Nombre
                </Text>
                <Text as="p" fontWeight="semibold">
                  {product.displayName}
                </Text>
              </BlockStack>
              {product.description && (
                <BlockStack gap="150">
                  <Text variant="bodySm" tone="subdued" as="span">
                    Descripción
                  </Text>
                  <Text as="p" tone="subdued">
                    {product.description}
                  </Text>
                </BlockStack>
              )}
              <BlockStack gap="150">
                <Text variant="bodySm" tone="subdued" as="span">
                  Tipo de producto
                </Text>
                <Text as="p" fontWeight="semibold">
                  {product.productType ?? "—"}
                </Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" tone="subdued" as="span">
                  Handle Shopify
                </Text>
                <Text as="p" fontWeight="semibold">
                  {product.shopifyHandle ?? "—"}
                </Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" tone="subdued" as="span">
                  Shopify Product ID
                </Text>
                <Text as="p" fontWeight="semibold">
                  {product.shopifyProductId ?? "—"}
                </Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" tone="subdued" as="span">
                  Estado
                </Text>
                <Badge tone={product.isActive ? "success" : "enabled"}>
                  {product.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Main */}
        <Layout.Section>
          <BlockStack gap="400">
            {syncResult && (
              <Banner tone="success" onDismiss={() => setSyncResult(null)}>
                Variantes resincronizadas: {syncResult.synced} vinculadas, {syncResult.skipped} omitidas.
              </Banner>
            )}

            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError(null)}>
                {saveError}
              </Banner>
            )}

            {/* Card — Imágenes Shopify */}
            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h2">
                  Imágenes (Shopify)
                </Text>
                {shopifyImages.length === 0 ? (
                  <Text as="p" tone="subdued">
                    {product.shopifyHandle
                      ? "Sin imágenes en Shopify."
                      : "Sin handle de Shopify — no se pueden cargar imágenes."}
                  </Text>
                ) : (
                  <InlineStack gap="300" wrap>
                    {shopifyImages.map((url, i) => (
                      <Thumbnail
                        key={i}
                        source={url}
                        alt={`Imagen ${i + 1}`}
                        size="large"
                      />
                    ))}
                  </InlineStack>
                )}
              </BlockStack>
            </Card>

            {/* Card — Variantes vinculadas */}
            <Card padding="0">
              <Box padding="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text variant="headingSm" as="h2">
                      Variantes / Formatos
                    </Text>
                    {variants && (
                      <Badge tone="info">
                        {String(variants.linkedVariants.length)}
                      </Badge>
                    )}
                  </InlineStack>
                  {loadingVariants && <Spinner size="small" />}
                </InlineStack>
              </Box>

              {variants && (
                <>
                  <IndexTable
                    resourceName={{
                      singular: "variante",
                      plural: "variantes",
                    }}
                    itemCount={variants.linkedVariants.length}
                    headings={[
                      { title: "Formato" },
                      { title: "Variante Shopify" },
                      { title: "Estado" },
                    ]}
                    selectable={false}
                    emptyState={
                      <Box padding="400">
                        <Text as="p" tone="subdued">
                          Sin variantes vinculadas.
                        </Text>
                      </Box>
                    }
                  >
                    {variants.linkedVariants.map((v, idx) => (
                      <IndexTable.Row
                        id={v.shopifyVariantId}
                        key={v.shopifyVariantId}
                        position={idx}
                      >
                        <IndexTable.Cell>
                          <Badge tone="success">{v.format.displayName}</Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text as="p" fontWeight="semibold">
                            {v.shopifyVariantTitle}
                          </Text>
                          <Text variant="bodySm" tone="subdued" as="span">
                            #{v.shopifyVariantId.replace(/\D/g, "")}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={v.isActive ? "success" : "enabled"}>
                            {v.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>

                  {variants.unlinkedVariants.length > 0 && (
                    <Box
                      padding="400"
                      borderColor="border"
                      borderBlockStartWidth="025"
                    >
                      <BlockStack gap="300">
                        <Banner tone="warning">
                          {variants.unlinkedVariants.length} variante
                          {variants.unlinkedVariants.length !== 1 ? "s" : ""}{" "}
                          sin vincular a ningún formato
                        </Banner>
                        {variants.unlinkedVariants.map((u) => (
                          <Box
                            key={u.shopifyVariantId}
                            padding="300"
                            borderColor="border"
                            borderWidth="025"
                            borderRadius="200"
                          >
                            <BlockStack gap="200">
                              <BlockStack gap="050">
                                <Text as="p" fontWeight="semibold">
                                  {u.shopifyVariantTitle}
                                </Text>
                                <Text variant="bodySm" tone="subdued" as="p">
                                  {u.reason}
                                </Text>
                              </BlockStack>
                              {formats.length === 0 ? (
                                <Text as="p" variant="bodySm" tone="subdued">
                                  No hay formatos activos.{" "}
                                  <Link href="/admin/formats">
                                    Crear o activar un formato
                                  </Link>
                                </Text>
                              ) : (
                                <InlineStack gap="200" blockAlign="end">
                                  <div style={{ minWidth: 220 }}>
                                    <Select
                                      label="Formato"
                                      labelHidden
                                      placeholder="Seleccionar formato…"
                                      options={formats.map((f) => ({
                                        label: `${f.displayName} (${f.aspectRatio})`,
                                        value: f.id,
                                      }))}
                                      value={
                                        selectedFormat[u.shopifyVariantId] ??
                                        ""
                                      }
                                      onChange={(value) =>
                                        setSelectedFormat((prev) => ({
                                          ...prev,
                                          [u.shopifyVariantId]: value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <Button
                                    variant="primary"
                                    size="slim"
                                    loading={
                                      linkingVariantId === u.shopifyVariantId
                                    }
                                    disabled={
                                      !selectedFormat[u.shopifyVariantId]
                                    }
                                    onClick={() => handleLinkVariant(u)}
                                  >
                                    Vincular
                                  </Button>
                                </InlineStack>
                              )}
                            </BlockStack>
                          </Box>
                        ))}
                      </BlockStack>
                    </Box>
                  )}
                </>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Modal de eliminación */}
      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
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
            disabled: deleting,
            onAction: () => setDeleteOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">
              Se eliminará{" "}
              <Text as="span" fontWeight="semibold">
                {product.displayName}
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
