"use client";

import { useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useBackendProductVariants } from "@/hooks/useBackendProductVariants";
import { getProduct } from "@/lib/shopify/actions/products";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";

/** Campos del ProductReference que necesita la card; la ruta devuelve la fila entera. */
interface GenerationProductRef {
  shopifyHandle: string | null;
  displayName?: string;
  template?: string | null;
  artKind?: string | null;
  isActive?: boolean;
}

interface UseGenerationProductArgs {
  /** ProductReference para el que se pidió la generación. null deja el hook inerte. */
  productRefId: string | null;
  /** Formato con el que se generó la obra; preselecciona su variante si mapea. */
  formatId?: string | null;
}

export interface UseGenerationProductResult {
  product: ShopifyProduct | null;
  /** Solo las variantes comprables. */
  variants: ShopifyVariant[];
  defaultImage: string | null;
  /** GID de la variante que corresponde a `formatId`; null si no mapea. */
  preselectedVariantId: string | null;
  loading: boolean;
  /** true cuando no hay producto de origen utilizable y hay que caer al kit PBN. */
  unavailable: boolean;
}

interface ResolvedRef {
  productRefId: string;
  handle: string | null;
  product: ShopifyProduct | null;
}

/**
 * Resuelve el producto Shopify para el que se pidió una generación: lee el
 * ProductReference (GET /products/:id, público) para su handle, carga el
 * producto Shopify (variantes, precios, imágenes) y cruza el `formatId` de la
 * generación con el mapeo formato→variante del backend para abrir la card en la
 * talla con la que se generó la obra.
 *
 * Mismo contrato que {@link usePbnProduct} — product/variants/defaultImage/
 * loading/unavailable — más la variante preseleccionada.
 */
export function useGenerationProduct({
  productRefId,
  formatId,
}: UseGenerationProductArgs): UseGenerationProductResult {
  const { get } = useAuthFetch();
  // El id resuelto se guarda junto al resultado: mientras no coincida con el
  // pedido, la petición sigue en vuelo. `loading` es derivado, así el efecto
  // nunca llama a setState de forma síncrona (react-hooks/set-state-in-effect).
  const [state, setState] = useState<ResolvedRef | null>(null);

  useEffect(() => {
    if (!productRefId) return;

    let cancelled = false;

    get<{ data: GenerationProductRef }>(`/products/${productRefId}`)
      .then(async (res) => {
        const ref = res.data;
        // Un producto desactivado ya no se vende, aunque su handle siga vivo.
        const handle =
          ref && ref.isActive !== false ? (ref.shopifyHandle ?? null) : null;
        const product = handle ? await getProduct(handle) : null;
        if (!cancelled) setState({ productRefId, handle, product });
      })
      .catch(() => {
        if (!cancelled) setState({ productRefId, handle: null, product: null });
      });

    return () => {
      cancelled = true;
    };
  }, [get, productRefId]);

  const settled = productRefId !== null && state?.productRefId === productRefId;
  const product = settled ? (state?.product ?? null) : null;
  const handle = settled ? (state?.handle ?? null) : null;

  // Mapeo formato→variante del backend. Es best-effort: si falla, la card cae a
  // su variante por defecto en vez de bloquear la compra.
  const { variants: backendVariants, isLoading: variantsLoading } =
    useBackendProductVariants(handle);

  const variants =
    product?.variants.edges
      .map((e) => e.node)
      .filter((v) => v.availableForSale) ?? [];

  const preselectedVariantId = formatId
    ? (backendVariants.find(
        (v) =>
          v.formatId === formatId &&
          variants.some((sv) => sv.id === v.shopifyVariantId),
      )?.shopifyVariantId ?? null)
    : null;

  return {
    product,
    variants,
    defaultImage: product?.images.edges[0]?.node.url ?? null,
    preselectedVariantId,
    loading: productRefId !== null && (!settled || variantsLoading),
    unavailable: productRefId === null || (settled && variants.length === 0),
  };
}
