"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { getProduct } from "@/lib/shopify/actions/products";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";

interface CreditPackRef {
  shopifyHandle: string | null;
  displayName?: string;
  description?: string | null;
  variants: { shopifyVariantId: string; creditAmount: number }[];
}

export interface CreditPackOption {
  variant: ShopifyVariant;
  creditAmount: number;
}

interface UseCreditPackProductResult {
  product: ShopifyProduct | null;
  options: CreditPackOption[];
  defaultImage: string | null;
  loading: boolean;
  /** true cuando no hay pack configurado o no pudo cargarse. */
  unavailable: boolean;
}

/**
 * Resuelve el producto Shopify dedicado a los packs de créditos: lee el
 * ProductReference configurado (GET /products/credit-pack) para su handle y el
 * mapeo variante→créditos, luego carga el producto Shopify (precios, imágenes,
 * disponibilidad) y cruza cada variante disponible con sus créditos por GID.
 */
export function useCreditPackProduct(): UseCreditPackProductResult {
  const { get } = useAuthFetch();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [creditByVariant, setCreditByVariant] = useState<Map<string, number>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(() => {
    return get<{ data: CreditPackRef }>("/products/credit-pack")
      .then(async (res) => {
        const handle = res.data?.shopifyHandle;
        if (!handle) {
          setUnavailable(true);
          return;
        }
        setCreditByVariant(
          new Map(
            (res.data.variants ?? []).map((v) => [
              v.shopifyVariantId,
              v.creditAmount,
            ]),
          ),
        );
        const shopifyProduct = await getProduct(handle);
        if (shopifyProduct) {
          setProduct(shopifyProduct);
        } else {
          setUnavailable(true);
        }
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, [get]);

  useEffect(() => {
    load();
  }, [load]);

  // Solo variantes disponibles y con créditos mapeados.
  const options: CreditPackOption[] =
    product?.variants.edges
      .map((e) => e.node)
      .filter((v) => v.availableForSale && creditByVariant.has(v.id))
      .map((v) => ({ variant: v, creditAmount: creditByVariant.get(v.id)! })) ??
    [];

  const defaultImage = product?.images.edges[0]?.node.url ?? null;

  return { product, options, defaultImage, loading, unavailable };
}
