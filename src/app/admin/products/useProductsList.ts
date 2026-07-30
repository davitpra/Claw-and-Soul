import { useEffect, useMemo, useState } from "react";
import {
  adminApi,
  AdminProduct,
  AdminStyle,
  SyncStatus,
} from "@/entities/admin/api";
import { resolveArtKind } from "@/entities/product/model/artKind";
import {
  ACCESSORY_TEMPLATE,
  resolveTemplate,
} from "./_components/ProductsTable";

type FulfillmentMethod = "in_house" | "pod";

/** Espera a que el backend termine la sincronización, que corre en async. */
const SYNC_SETTLE_MS = 1500;

/**
 * Encapsula la carga de datos, el estado y las acciones de la lista de productos
 * del admin. Los cambios de campo se aplican de forma optimista sobre la lista y
 * se revierten recargando del servidor si el guardado falla.
 *
 * Recibe `productTypeMap` (de `useShopifyProductMeta`) porque el template
 * efectivo de un producto puede venir heredado del `productType` de Shopify, y
 * de él depende la partición entre productos y accesorios (ver
 * `resolveTemplate`).
 */
export function useProductsList(productTypeMap: Record<string, string>) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [styles, setStyles] = useState<AdminStyle[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [savingStyle, setSavingStyle] = useState<string | null>(null);
  const [savingFulfillment, setSavingFulfillment] = useState<string | null>(
    null,
  );
  const [savingTemplate, setSavingTemplate] = useState<string | null>(null);
  const [savingPbn, setSavingPbn] = useState(false);
  const [savingCreditPack, setSavingCreditPack] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<AdminProduct | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

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
      .catch(() => {
        // best-effort: la card de sync es informativa
      });
  };

  const loadStyles = () => {
    adminApi.styles
      .list()
      .then((all) => setStyles(all.filter((s) => s.isActive)))
      .catch(() => {
        // best-effort: sin estilos el Select queda en "Sin asignar"
      });
  };

  useEffect(() => {
    loadProducts();
    loadSyncStatus();
    loadStyles();
  }, []);

  /**
   * Aplica un cambio optimista sobre la lista y lo guarda en el backend. Si el
   * guardado falla, publica el error y recarga del servidor para descartar el
   * cambio optimista.
   */
  const runOptimistic = async (
    patch: (prev: AdminProduct[]) => AdminProduct[],
    save: () => Promise<unknown>,
  ) => {
    setProducts(patch);
    try {
      await save();
    } catch (e: unknown) {
      setError((e as Error).message);
      loadProducts();
    }
  };

  /**
   * Los roles PBN y Credit Pack son excluyentes: asignar uno desasigna al
   * anterior. El backend garantiza la unicidad; aquí solo la reflejamos.
   */
  const setExclusiveRole = async (
    field: "isPaintByNumbers" | "isCreditPack",
    productId: string,
    save: (target: string | null) => Promise<void>,
    setSaving: (value: boolean) => void,
  ) => {
    const target = productId || null;
    setSaving(true);
    await runOptimistic(
      (prev) => prev.map((p) => ({ ...p, [field]: p.id === target })),
      () => save(target),
    );
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await adminApi.sync.trigger();
      await new Promise((r) => setTimeout(r, SYNC_SETTLE_MS));
      loadSyncStatus();
      loadProducts();
    } catch (e: unknown) {
      setError((e as Error).message);
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
      setError((e as Error).message);
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
    const fulfillmentMethod = value as FulfillmentMethod;
    setSavingFulfillment(productId);
    await runOptimistic(
      (prev) =>
        prev.map((p) => (p.id === productId ? { ...p, fulfillmentMethod } : p)),
      () => adminApi.products.update(productId, { fulfillmentMethod }),
    );
    setSavingFulfillment(null);
  };

  const handleTemplateChange = async (productId: string, value: string) => {
    const template = value || null;
    setSavingTemplate(productId);
    await runOptimistic(
      (prev) => prev.map((p) => (p.id === productId ? { ...p, template } : p)),
      () => adminApi.products.update(productId, { template }),
    );
    setSavingTemplate(null);
  };

  const handleStyleChange = async (productId: string, newStyleId: string) => {
    const styleId = newStyleId || null;
    const selected = styleId ? styles.find((s) => s.id === styleId) : undefined;
    const style = selected
      ? {
          id: selected.id,
          name: selected.name,
          displayName: selected.displayName,
          previewUrl: selected.previewUrl,
        }
      : null;

    setSavingStyle(productId);
    await runOptimistic(
      (prev) =>
        prev.map((p) => (p.id === productId ? { ...p, styleId, style } : p)),
      () => adminApi.products.update(productId, { styleId }),
    );
    setSavingStyle(null);
  };

  const handlePbnChange = (productId: string) =>
    setExclusiveRole(
      "isPaintByNumbers",
      productId,
      (target) => adminApi.products.setPbn(target),
      setSavingPbn,
    );

  const handleCreditPackChange = (productId: string) =>
    setExclusiveRole(
      "isCreditPack",
      productId,
      (target) => adminApi.products.setCreditPack(target),
      setSavingCreditPack,
    );

  const pbnProduct = products.find((p) => p.isPaintByNumbers) ?? null;
  const creditPackProduct = products.find((p) => p.isCreditPack) ?? null;

  // Los productos asignados a un rol especial se muestran en su card y se
  // excluyen de las tablas para no duplicarlos. El resto se reparte en dos
  // pasos: primero por formato (un producto es accesorio cuando su template
  // efectivo es "Accessory", que sale del metafield `custom.art_kind` de Shopify
  // —sync → `isAccessory`— o, para los legacy, del template guardado / el
  // productType) y después por contenido (`resolveArtKind`, que cae al template
  // para los legacy sin metafield). Lo que no se puede clasificar —template
  // vacío o "Credits"— va a su propia lista en vez de desaparecer, para que un
  // producto mal etiquetado en Shopify se note.
  const { pbnProducts, printProducts, unclassifiedProducts, accessoryProducts } =
    useMemo(() => {
      const specialIds = new Set(
        [pbnProduct?.id, creditPackProduct?.id].filter(Boolean),
      );
      const buckets = {
        pbnProducts: [] as AdminProduct[],
        printProducts: [] as AdminProduct[],
        unclassifiedProducts: [] as AdminProduct[],
        accessoryProducts: [] as AdminProduct[],
      };

      for (const p of products) {
        if (specialIds.has(p.id)) continue;
        const template = resolveTemplate(p, productTypeMap);
        if (template === ACCESSORY_TEMPLATE) {
          buckets.accessoryProducts.push(p);
          continue;
        }
        const artKind = resolveArtKind(template, p.artKind);
        if (artKind === "pbn") buckets.pbnProducts.push(p);
        else if (artKind === "print") buckets.printProducts.push(p);
        else buckets.unclassifiedProducts.push(p);
      }

      return buckets;
    }, [products, productTypeMap, pbnProduct?.id, creditPackProduct?.id]);

  return {
    // data
    products,
    styles,
    syncStatus,
    pbnProduct,
    creditPackProduct,
    pbnProducts,
    printProducts,
    unclassifiedProducts,
    accessoryProducts,
    // status
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
    // setters
    setError,
    setDeletingTarget,
    // actions
    handleSync,
    handleToggle,
    handleDelete,
    handleFulfillmentChange,
    handleTemplateChange,
    handleStyleChange,
    handlePbnChange,
    handleCreditPackChange,
  };
}
