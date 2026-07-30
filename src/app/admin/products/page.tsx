"use client";

import { useRouter } from "next/navigation";
import {
  Page,
  Card,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import { DeleteProductModal } from "@/app/admin/_components/DeleteProductModal";
import { ART_KIND_LABELS } from "@/entities/product/model/artKind";
import { ProductsTableCard } from "./_components/ProductsTableCard";
import { SpecialRoleCard } from "./_components/SpecialRoleCard";
import { SyncStatusCard } from "./_components/SyncStatusCard";
import { useProductsList } from "./useProductsList";
import { useShopifyProductMeta } from "./useShopifyProductMeta";

export default function AdminProductsPage() {
  const router = useRouter();
  const { imageMap, productTypeMap } = useShopifyProductMeta();
  const {
    products,
    styles,
    syncStatus,
    pbnProduct,
    creditPackProduct,
    pbnProducts,
    printProducts,
    unclassifiedProducts,
    accessoryProducts,
    loading,
    error,
    syncing,
    toggling,
    savingStyle,
    savingFulfillment,
    savingTemplate,
    savingPbn,
    savingCreditPack,
    deletingTarget,
    deleting,
    setError,
    setDeletingTarget,
    handleSync,
    handleToggle,
    handleDelete,
    handleFulfillmentChange,
    handleTemplateChange,
    handleStyleChange,
    handlePbnChange,
    handleCreditPackChange,
  } = useProductsList(productTypeMap);

  const goToProduct = (id: string) => router.push(`/admin/products/${id}`);

  // Props compartidas por la tabla de productos y la de accesorios: solo
  // difieren en la lista que reciben y en la columna de estilo.
  const tableProps = {
    styles,
    imageMap,
    productTypeMap,
    savingStyle,
    savingFulfillment,
    savingTemplate,
    toggling,
    onRowClick: goToProduct,
    onStyleChange: handleStyleChange,
    onFulfillmentChange: handleFulfillmentChange,
    onTemplateChange: handleTemplateChange,
    onToggleActive: handleToggle,
    onDelete: setDeletingTarget,
  };

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
            <ProductsTableCard
              {...tableProps}
              title={ART_KIND_LABELS.pbn}
              helpText="Productos cuyo contenido es un coloreable para pintar."
              products={pbnProducts}
              showStyleColumn
            />

            <ProductsTableCard
              {...tableProps}
              title={ART_KIND_LABELS.print}
              helpText="Productos cuyo contenido es arte terminado, listo para colgar."
              products={printProducts}
              showStyleColumn
            />

            <ProductsTableCard
              {...tableProps}
              title="Sin clasificar"
              helpText="Sin contenido asignado: define el metafield custom.art_kind en Shopify y vuelve a sincronizar."
              products={unclassifiedProducts}
              showStyleColumn
              hideWhenEmpty
            />

            <ProductsTableCard
              {...tableProps}
              title="Accesorios"
              products={accessoryProducts}
            />
          </>
        )}
        {!loading && (
          <>
            <SpecialRoleCard
              title="Producto Paint by Numbers"
              label="Kit dedicado al comprar un PBN guardado"
              helpText="Solo puede haber uno. Elegir otro reemplaza al anterior automáticamente."
              products={products}
              selected={pbnProduct}
              imageMap={imageMap}
              saving={savingPbn}
              onChange={handlePbnChange}
              onRowClick={goToProduct}
            />

            <SpecialRoleCard
              title="Producto Credit Pack"
              label="Producto dedicado a la venta de créditos"
              helpText="Solo puede haber uno. Configura los créditos por variante en la página del producto."
              products={products}
              selected={creditPackProduct}
              imageMap={imageMap}
              saving={savingCreditPack}
              onChange={handleCreditPackChange}
              onRowClick={goToProduct}
            />
          </>
        )}
        {syncStatus && <SyncStatusCard syncStatus={syncStatus} />}
      </BlockStack>

      <DeleteProductModal
        open={deletingTarget !== null}
        deleting={deleting}
        productName={deletingTarget?.displayName ?? ""}
        onClose={() => setDeletingTarget(null)}
        onConfirm={handleDelete}
      />
    </Page>
  );
}
