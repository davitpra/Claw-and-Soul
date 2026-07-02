"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Page,
  Layout,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
} from "@shopify/polaris";
import { ExternalIcon, DeleteIcon, RefreshIcon } from "@shopify/polaris-icons";
import { ProductDetailsSidebar } from "./_components/ProductDetailsSidebar";
import { LinkedVariantsCard } from "./_components/LinkedVariantsCard";
import { DeleteProductModal } from "./_components/DeleteProductModal";
import { FormatsModal } from "./_components/FormatsModal";
import { PodConfigModal } from "./_components/PodConfigModal";
import {
  useProductDetail,
  type AdminProductVariantLink,
} from "./useProductDetail";
import { shopifyProductUrl } from "@/entities/admin/lib/shopify-admin-url";

const BACK_ACTION = { url: "/admin/products", content: "Productos" };

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    product,
    variants,
    styles,
    formats,
    allFormats,
    loading,
    error,
    saving,
    saveError,
    toggling,
    loadingVariants,
    syncingVariants,
    syncResult,
    deleteOpen,
    deleting,
    styleId,
    fulfillmentMethod,
    setError,
    setSaveError,
    setSyncResult,
    setDeleteOpen,
    setStyleId,
    setFulfillmentMethod,
    loadFormats,
    loadVariants,
    handleSave,
    handleSyncVariants,
    handleToggle,
    handleDelete,
  } = useProductDetail(id);

  // Modal state with no async logic of its own stays local to the view.
  const [formatsModalOpen, setFormatsModalOpen] = useState(false);
  const [podConfigVariant, setPodConfigVariant] =
    useState<AdminProductVariantLink | null>(null);

  if (loading) {
    return (
      <Page backAction={BACK_ACTION} title="Cargando…">
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
      <Page backAction={BACK_ACTION} title="Producto">
        <Banner tone="critical">{error ?? "Producto no encontrado."}</Banner>
      </Page>
    );
  }

  return (
    <Page
      backAction={BACK_ACTION}
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
                url: shopifyProductUrl(product.shopifyProductId),
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

            <LinkedVariantsCard
              product={product}
              variants={variants}
              formats={formats}
              fulfillmentMethod={fulfillmentMethod}
              loadingVariants={loadingVariants}
              onChanged={() => loadVariants(product.id)}
              onOpenPodConfig={setPodConfigVariant}
              onManageFormats={() => setFormatsModalOpen(true)}
              onError={setError}
            />
          </BlockStack>
        </Layout.Section>
        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <ProductDetailsSidebar
            product={product}
            styles={styles}
            styleId={styleId}
            onStyleChange={setStyleId}
            fulfillmentMethod={fulfillmentMethod}
            onFulfillmentChange={setFulfillmentMethod}
            saving={saving}
            onSave={handleSave}
          />
        </Layout.Section>
      </Layout>

      <DeleteProductModal
        open={deleteOpen}
        deleting={deleting}
        productName={product.displayName}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <FormatsModal
        open={formatsModalOpen}
        allFormats={allFormats}
        onClose={() => setFormatsModalOpen(false)}
        onChanged={loadFormats}
      />

      <PodConfigModal
        variant={podConfigVariant}
        productId={product.id}
        onClose={() => setPodConfigVariant(null)}
        onSaved={() => {
          loadVariants(product.id);
          setPodConfigVariant(null);
        }}
      />
    </Page>
  );
}
