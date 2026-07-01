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
type FulfillmentMethod = "in_house" | "pod";

/**
 * Encapsula toda la carga de datos, estado y acciones de la página de detalle
 * de producto del admin. Cruza el producto del backend con sus variantes
 * vinculadas y expone los handlers de guardado / activación / resincronización /
 * borrado.
 */
export function useProductDetail(id: string) {
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [variants, setVariants] = useState<AdminProductVariants | null>(null);
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [allFormats, setAllFormats] = useState<AdminFormat[]>([]);
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

  return {
    // data
    product,
    variants,
    styles,
    formats,
    allFormats,
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
