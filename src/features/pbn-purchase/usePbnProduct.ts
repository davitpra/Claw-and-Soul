"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { getProduct } from "@/lib/shopify/actions/products";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";

interface PbnProductRef {
  shopifyHandle: string | null;
  displayName?: string;
}

interface UsePbnProductResult {
  product: ShopifyProduct | null;
  variants: ShopifyVariant[];
  defaultImage: string | null;
  loading: boolean;
  /** true when no PBN product is configured or it couldn't be loaded. */
  unavailable: boolean;
}

/**
 * Resolves the dedicated Paint-by-Numbers Shopify product: reads the configured
 * ProductReference (GET /products/pbn) for its handle, then loads the Shopify
 * product for its variants (sizes), prices and image.
 */
export function usePbnProduct(): UsePbnProductResult {
  const { get } = useAuthFetch();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(() => {
    return get<{ data: PbnProductRef }>("/products/pbn")
      .then(async (res) => {
        const handle = res.data?.shopifyHandle;
        if (!handle) {
          setUnavailable(true);
          return;
        }
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

  const variants =
    product?.variants.edges
      .map((e) => e.node)
      .filter((v) => v.availableForSale) ?? [];
  const defaultImage = product?.images.edges[0]?.node.url ?? null;

  return { product, variants, defaultImage, loading, unavailable };
}
