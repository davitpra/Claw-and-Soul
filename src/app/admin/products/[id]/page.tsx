"use client";

import { useEffect, useState } from "react";
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
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { ExternalIcon, DeleteIcon, RefreshIcon, ViewIcon } from "@shopify/polaris-icons";
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
  const [allFormats, setAllFormats] = useState<AdminFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>(
    {},
  );
  const [linkingVariantId, setLinkingVariantId] = useState<string | null>(null);
  const [shopifyImages, setShopifyImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [syncingVariants, setSyncingVariants] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    skipped: number;
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [styleId, setStyleId] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"in_house" | "pod">("in_house");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editFormatId, setEditFormatId] = useState<Record<string, string>>({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [togglingVariantId, setTogglingVariantId] = useState<string | null>(
    null,
  );
  const [formatsModalOpen, setFormatsModalOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<AdminFormat | null>(null);
  const [editFormatForm, setEditFormatForm] = useState({ displayName: "", aspectRatio: "", shopifyVariantOption: "" });
  const [savingFormatEdit, setSavingFormatEdit] = useState(false);
  const [formatEditError, setFormatEditError] = useState<string | null>(null);
  const [togglingFormat, setTogglingFormat] = useState<string | null>(null);

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

  const loadFormats = async () => {
    try {
      const f = await adminApi.formats.list();
      setFormats(f.filter((x) => x.isActive));
      setAllFormats(f);
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
        setAllFormats(f);
        setStyleId(p.styleId ?? "");
        setFulfillmentMethod((p.fulfillmentMethod as "in_house" | "pod") ?? "in_house");
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
        fulfillmentMethod,
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

  const handleFormatEditOpen = (f: AdminFormat) => {
    setEditFormatForm({
      displayName: f.displayName,
      aspectRatio: f.aspectRatio,
      shopifyVariantOption: f.shopifyVariantOption ?? "",
    });
    setEditingFormat(f);
    setFormatEditError(null);
  };

  const handleFormatEditSave = async () => {
    if (!editingFormat) return;
    setSavingFormatEdit(true);
    setFormatEditError(null);
    try {
      await adminApi.formats.update(editingFormat.id, {
        displayName: editFormatForm.displayName,
        aspectRatio: editFormatForm.aspectRatio,
        shopifyVariantOption: editFormatForm.shopifyVariantOption.trim() || null,
      });
      setEditingFormat(null);
      await loadFormats();
    } catch (e: unknown) {
      setFormatEditError((e as Error).message);
    } finally {
      setSavingFormatEdit(false);
    }
  };

  const handleFormatToggle = async (f: AdminFormat) => {
    setTogglingFormat(f.id);
    try {
      if (f.isActive) {
        await adminApi.formats.deactivate(f.id);
      } else {
        await adminApi.formats.update(f.id, { isActive: true });
      }
      await loadFormats();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setTogglingFormat(null);
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

  const handleStartEdit = (v: {
    shopifyVariantId: string;
    format: { id: string };
  }) => {
    setEditingVariantId(v.shopifyVariantId);
    setEditFormatId((prev) => ({ ...prev, [v.shopifyVariantId]: v.format.id }));
  };

  const handleCancelEdit = () => setEditingVariantId(null);

  const handleSaveVariant = async (v: {
    shopifyVariantId: string;
    format: { id: string };
  }) => {
    if (!product) return;
    const chosenFormatId = editFormatId[v.shopifyVariantId];
    if (chosenFormatId === v.format.id) {
      setEditingVariantId(null);
      return;
    }
    setSavingVariantId(v.shopifyVariantId);
    try {
      await adminApi.products.updateVariant(product.id, v.shopifyVariantId, {
        formatId: chosenFormatId,
      });
      await loadVariants(product.id);
      setEditingVariantId(null);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSavingVariantId(null);
    }
  };

  const handleToggleVariantActive = async (v: {
    shopifyVariantId: string;
    isActive: boolean;
  }) => {
    if (!product) return;
    setTogglingVariantId(v.shopifyVariantId);
    try {
      await adminApi.products.updateVariant(product.id, v.shopifyVariantId, {
        isActive: !v.isActive,
      });
      await loadVariants(product.id);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setTogglingVariantId(null);
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
              <Select
                label="Método de fulfillment"
                options={[
                  { label: "Taller (in-house)", value: "in_house" },
                  { label: "POD (proveedor externo)", value: "pod" },
                ]}
                value={fulfillmentMethod}
                onChange={(v) => setFulfillmentMethod(v as "in_house" | "pod")}
                helpText="Define cómo se cumplirán los pedidos de este producto por defecto."
              />
              {assignedStyle?.previewUrl && (
                <InlineStack gap="200" blockAlign="center">
                  <Thumbnail
                    source={assignedStyle.previewUrl}
                    alt={assignedStyle.displayName}
                    size="medium"
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
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Nombre
                </Text>
                <Text as="p" fontWeight="regular">
                  {product.displayName}
                </Text>
              </BlockStack>
              {product.description && (
                <BlockStack gap="150">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    Descripción
                  </Text>
                  <Text as="p">{product.description}</Text>
                </BlockStack>
              )}
              <BlockStack gap="150">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Tipo de producto
                </Text>
                <Text as="p">{product.productType ?? "—"}</Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Handle Shopify
                </Text>
                <Text as="p">{product.shopifyHandle ?? "—"}</Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Shopify Product ID
                </Text>
                <Text as="p">{product.shopifyProductId ?? "—"}</Text>
              </BlockStack>
              <BlockStack gap="150">
                <Text variant="bodySm" as="span" fontWeight="bold">
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
                Variantes resincronizadas: {syncResult.synced} vinculadas,{" "}
                {syncResult.skipped} omitidas.
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
                  <InlineStack gap="200" blockAlign="center">
                    {loadingVariants && <Spinner size="small" />}
                    <Button
                      variant="plain"
                      size="slim"
                      icon={ViewIcon}
                      onClick={() => setFormatsModalOpen(true)}
                    >
                      Ver formatos
                    </Button>
                  </InlineStack>
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
                      { title: "Acciones" },
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
                    {variants.linkedVariants.map((v, idx) => {
                      const isEditing = editingVariantId === v.shopifyVariantId;
                      const isSaving = savingVariantId === v.shopifyVariantId;
                      const isToggling =
                        togglingVariantId === v.shopifyVariantId;

                      const formatOptions = formats.map((f) => ({
                        label: `${f.displayName} (${f.aspectRatio})`,
                        value: f.id,
                      }));
                      const currentFormatInList = formats.some(
                        (f) => f.id === v.format.id,
                      );
                      if (!currentFormatInList) {
                        formatOptions.unshift({
                          label: `${v.format.displayName} (inactivo)`,
                          value: v.format.id,
                        });
                      }

                      return (
                        <IndexTable.Row
                          id={v.shopifyVariantId}
                          key={v.shopifyVariantId}
                          position={idx}
                        >
                          <IndexTable.Cell>
                            {isEditing ? (
                              <div style={{ minWidth: 220 }}>
                                <Select
                                  label="Formato"
                                  labelHidden
                                  options={formatOptions}
                                  value={
                                    editFormatId[v.shopifyVariantId] ??
                                    v.format.id
                                  }
                                  onChange={(value) =>
                                    setEditFormatId((prev) => ({
                                      ...prev,
                                      [v.shopifyVariantId]: value,
                                    }))
                                  }
                                />
                              </div>
                            ) : (
                              <Badge tone="success">
                                {v.format.displayName}
                              </Badge>
                            )}
                          </IndexTable.Cell>
                          <IndexTable.Cell>
                            <Text as="p" fontWeight="bold">
                              {v.shopifyVariantTitle}
                            </Text>
                            <Text variant="bodySm" tone="subdued" as="span">
                              #{v.shopifyVariantId.replace(/\D/g, "")}
                            </Text>
                          </IndexTable.Cell>
                          <IndexTable.Cell>
                            <InlineStack gap="200" blockAlign="center">
                              <button
                                type="button"
                                onClick={() => handleToggleVariantActive(v)}
                                disabled={isToggling}
                                aria-label={
                                  v.isActive
                                    ? "Desactivar variante"
                                    : "Activar variante"
                                }
                                title={
                                  v.isActive
                                    ? "Click para desactivar"
                                    : "Click para activar"
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: 0,
                                  cursor: isToggling ? "wait" : "pointer",
                                  opacity: isToggling ? 0.6 : 1,
                                }}
                              >
                                <Badge
                                  tone={v.isActive ? "success" : "enabled"}
                                >
                                  {v.isActive ? "Activa" : "Inactiva"}
                                </Badge>
                              </button>
                              {isToggling && <Spinner size="small" />}
                            </InlineStack>
                          </IndexTable.Cell>
                          <IndexTable.Cell>
                            {isEditing ? (
                              <InlineStack gap="200">
                                <Button
                                  variant="primary"
                                  size="slim"
                                  loading={isSaving}
                                  disabled={!editFormatId[v.shopifyVariantId]}
                                  onClick={() => handleSaveVariant(v)}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="slim"
                                  disabled={isSaving}
                                  onClick={handleCancelEdit}
                                >
                                  Cancelar
                                </Button>
                              </InlineStack>
                            ) : (
                              <Button
                                size="slim"
                                onClick={() => handleStartEdit(v)}
                              >
                                Editar
                              </Button>
                            )}
                          </IndexTable.Cell>
                        </IndexTable.Row>
                      );
                    })}
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
                          {variants.unlinkedVariants.length !== 1
                            ? "s"
                            : ""}{" "}
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
                                  <Button
                                    variant="plain"
                                    onClick={() => setFormatsModalOpen(true)}
                                  >
                                    Gestionar formatos
                                  </Button>
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
                                        selectedFormat[u.shopifyVariantId] ?? ""
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

      <Modal
        open={formatsModalOpen}
        onClose={() => setFormatsModalOpen(false)}
        title="Formatos"
        secondaryActions={[
          { content: "Cerrar", onAction: () => setFormatsModalOpen(false) },
        ]}
        size="large"
      >
        <Modal.Section flush>
          <IndexTable
            resourceName={{ singular: "formato", plural: "formatos" }}
            itemCount={allFormats.length}
            headings={[
              { title: "Nombre" },
              { title: "Proporción" },
              { title: "Dimensiones" },
              { title: "Opción Shopify" },
              { title: "Estado" },
              { title: "Acciones" },
            ]}
            selectable={false}
          >
            {allFormats.map((f, index) => (
              <IndexTable.Row
                id={f.id}
                key={f.id}
                position={index}
                tone={f.isActive ? undefined : "subdued"}
              >
                <IndexTable.Cell>
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {f.displayName}
                  </Text>
                  <br />
                  <Text variant="bodySm" tone="subdued" as="span">
                    {f.name}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.aspectRatio}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.width} × {f.height}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.shopifyVariantOption ?? "—"}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  {togglingFormat === f.id ? (
                    <Spinner size="small" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFormatToggle(f)}
                      style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
                      aria-label={f.isActive ? "Desactivar formato" : "Activar formato"}
                    >
                      <Badge tone={f.isActive ? "success" : "enabled"}>
                        {f.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </button>
                  )}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Button
                    variant="plain"
                    size="slim"
                    onClick={() => handleFormatEditOpen(f)}
                  >
                    Editar
                  </Button>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Modal.Section>
      </Modal>

      <Modal
        open={!!editingFormat}
        onClose={() => { if (!savingFormatEdit) setEditingFormat(null); }}
        title={`Editar formato — ${editingFormat?.displayName ?? ""}`}
        primaryAction={{
          content: "Guardar",
          loading: savingFormatEdit,
          onAction: handleFormatEditSave,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: savingFormatEdit,
            onAction: () => setEditingFormat(null),
          },
        ]}
      >
        <Modal.Section>
          {formatEditError && (
            <Banner tone="critical" onDismiss={() => setFormatEditError(null)}>
              {formatEditError}
            </Banner>
          )}
          <FormLayout>
            <TextField
              label="Nombre visible"
              value={editFormatForm.displayName}
              onChange={(v) => setEditFormatForm((p) => ({ ...p, displayName: v }))}
              autoComplete="off"
            />
            <TextField
              label="Proporción (aspectRatio)"
              value={editFormatForm.aspectRatio}
              onChange={(v) => setEditFormatForm((p) => ({ ...p, aspectRatio: v }))}
              autoComplete="off"
              helpText='Ej: "4:3", "1:1", "16:9"'
            />
            <TextField
              label="Opción Shopify (shopifyVariantOption)"
              value={editFormatForm.shopifyVariantOption}
              onChange={(v) => setEditFormatForm((p) => ({ ...p, shopifyVariantOption: v }))}
              autoComplete="off"
              helpText='Valor exacto del option1 de la variante en Shopify. Ej: "8x10". Dejar vacío para desvincularlo.'
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
