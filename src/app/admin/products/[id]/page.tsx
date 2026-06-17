"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  adminApi,
  AdminProduct,
  AdminStyle,
  AdminFormat,
  AdminProductVariants,
  AdminProductVariantLink,
} from "@/entities/admin/api";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";
import { ContextualImagesCard } from "./ContextualImagesCard";
import { ShowcaseCollectionCard } from "./ShowcaseCollectionCard";
import { ProductDetailsSidebar } from "./ProductDetailsSidebar";
import { LinkedVariantsCard } from "./LinkedVariantsCard";
import { DeleteProductModal } from "./DeleteProductModal";
import { FormatsModal } from "./FormatsModal";
import { PodConfigModal } from "./PodConfigModal";

// Reduce a Shopify variant id to its numeric tail. The Storefront API returns
// GIDs (gid://shopify/ProductVariant/123) while the admin getVariants endpoint
// returns the bare numeric id; normalizing lets the two line up.
const variantNumericId = (id: string) => id.split("/").pop() ?? id;

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [variants, setVariants] = useState<AdminProductVariants | null>(null);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [allFormats, setAllFormats] = useState<AdminFormat[]>([]);
  const [shopifyVariantImages, setShopifyVariantImages] = useState<
    Record<string, { url: string; alt: string | null }>
  >({});
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
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "in_house" | "pod"
  >("in_house");
  const [formatsModalOpen, setFormatsModalOpen] = useState(false);
  const [podConfigVariant, setPodConfigVariant] =
    useState<AdminProductVariantLink | null>(null);

  const loadShopifyImages = async (handle: string) => {
    try {
      const { data } = await shopifyFetch<{
        product: {
          variants: {
            edges: Array<{
              node: {
                id: string;
                image: { url: string; altText: string | null } | null;
              };
            }>;
          };
        } | null;
      }>({ query: GET_PRODUCT, variables: { handle } });
      const byVariant: Record<string, { url: string; alt: string | null }> = {};
      for (const { node } of data.product?.variants.edges ?? []) {
        if (node.image) {
          // Storefront ids are GIDs (gid://shopify/ProductVariant/123) but the
          // admin getVariants endpoint returns the bare numeric id — key by the
          // numeric tail so both sides match.
          byVariant[variantNumericId(node.id)] = {
            url: node.image.url,
            alt: node.image.altText,
          };
        }
      }
      setShopifyVariantImages(byVariant);
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
        setFulfillmentMethod(
          (p.fulfillmentMethod as "in_house" | "pod") ?? "in_house",
        );
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

  // Linked Shopify variants (with their format) — the buckets for contextual images.
  const productVariants = (variants?.linkedVariants ?? []).map((v) => ({
    id: v.id,
    title: v.shopifyVariantTitle,
    formatId: v.format.id,
    formatName: v.format.displayName,
    shopifyImageUrl:
      shopifyVariantImages[variantNumericId(v.shopifyVariantId)]?.url ?? null,
    shopifyImageAlt:
      shopifyVariantImages[variantNumericId(v.shopifyVariantId)]?.alt ?? null,
  }));

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

            <ContextualImagesCard
              productId={product.id}
              variants={productVariants}
            />

            <ShowcaseCollectionCard
              productId={product.id}
              initialHandle={product.showcaseCollectionHandle}
            />

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
