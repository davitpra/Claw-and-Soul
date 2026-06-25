import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

// Reduce a Shopify variant id to its numeric tail. The Storefront API returns
// GIDs (gid://shopify/ProductVariant/123) while the admin getVariants endpoint
// returns the bare numeric id; normalizing lets the two line up.
const variantNumericId = (id: string) => id.split("/").pop() ?? id;

type FulfillmentMethod = "in_house" | "pod";

type ShopifyVariantImage = { url: string; alt: string | null };

// Linked Shopify variant enriched with its contextual image — the bucket shape
// the ContextualImagesCard consumes.
export interface ProductVariantBucket {
  id: string;
  title: string;
  formatId: string;
  formatName: string;
  shopifyImageUrl: string | null;
  shopifyImageAlt: string | null;
}

/**
 * Encapsula toda la carga de datos, estado y acciones de la página de detalle
 * de producto del admin. Cruza el producto del backend con sus variantes
 * vinculadas y las imágenes de variante del Storefront de Shopify, y expone los
 * handlers de guardado / activación / resincronización / borrado.
 */
export function useProductDetail(id: string) {
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [variants, setVariants] = useState<AdminProductVariants | null>(null);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [allFormats, setAllFormats] = useState<AdminFormat[]>([]);
  const [shopifyVariantImages, setShopifyVariantImages] = useState<
    Record<string, ShopifyVariantImage>
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
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("in_house");

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
      const byVariant: Record<string, ShopifyVariantImage> = {};
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
          (p.fulfillmentMethod as FulfillmentMethod) ?? "in_house",
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

  // Linked Shopify variants (with their format) — the buckets for contextual images.
  const productVariants: ProductVariantBucket[] = (
    variants?.linkedVariants ?? []
  ).map((v) => ({
    id: v.id,
    title: v.shopifyVariantTitle,
    formatId: v.format.id,
    formatName: v.format.displayName,
    shopifyImageUrl:
      shopifyVariantImages[variantNumericId(v.shopifyVariantId)]?.url ?? null,
    shopifyImageAlt:
      shopifyVariantImages[variantNumericId(v.shopifyVariantId)]?.alt ?? null,
  }));

  return {
    // data
    product,
    variants,
    styles,
    formats,
    allFormats,
    productVariants,
    // status
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
    // form state
    styleId,
    fulfillmentMethod,
    // setters
    setError,
    setSaveError,
    setSyncResult,
    setDeleteOpen,
    setStyleId,
    setFulfillmentMethod,
    // actions
    loadFormats,
    loadVariants,
    handleSave,
    handleSyncVariants,
    handleToggle,
    handleDelete,
  };
}

export type { AdminProductVariantLink };
