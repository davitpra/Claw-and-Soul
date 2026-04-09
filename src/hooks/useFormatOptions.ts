import { useState, useEffect } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";
import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface CompatFormat {
  id: string;
  name: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  shopifyVariantId: string | null;
  shopifyVariantOption: string | null;
}

export interface FormatOption {
  formatId: string;
  name: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  shopifyVariantId: string;
  price: string;
  currencyCode: string;
  availableForSale: boolean;
}

interface UseFormatOptionsResult {
  formats: FormatOption[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches compat formats from the backend and variant pricing from Shopify in parallel,
 * then merges them by shopifyVariantId.
 *
 * Only returns formats that:
 * - Have a shopifyVariantId (configured in product_format_variants)
 * - Are availableForSale in Shopify
 */
export function useFormatOptions(
  productHandle: string | null,
  productId: string | null
): UseFormatOptionsResult {
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productHandle || !productId) {
      setFormats([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      // Backend: compat formats with shopifyVariantId
      fetch(`${API_URL}/compat/formats?product_id=${productId}`, {
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error(`Compat API error: ${res.status}`);
        return res.json() as Promise<CompatFormat[]>;
      }),

      // Shopify: variant pricing and availability
      shopifyFetch<{ product: ShopifyProduct }>({
        query: GET_PRODUCT,
        variables: { handle: productHandle },
      }).then((res) => res.data.product),
    ])
      .then(([compatFormats, shopifyProduct]) => {
        if (cancelled) return;

        if (!shopifyProduct) {
          setError(`Product '${productHandle}' not found in Shopify`);
          setFormats([]);
          return;
        }

        const variantMap = new Map<string, ShopifyVariant>();
        for (const edge of shopifyProduct.variants.edges) {
          variantMap.set(edge.node.id, edge.node);
        }

        const merged = mergeFormatsWithVariants(compatFormats, variantMap);
        setFormats(merged);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useFormatOptions error:", err);
        setError("Failed to load format options. Please try again.");
        setFormats([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productHandle, productId]);

  return { formats, isLoading, error };
}

function mergeFormatsWithVariants(
  compatFormats: CompatFormat[],
  variantMap: Map<string, ShopifyVariant>
): FormatOption[] {
  return compatFormats
    .filter((f) => f.shopifyVariantId !== null)
    .map((format) => {
      const variant = variantMap.get(format.shopifyVariantId!);
      if (!variant) return null;

      return {
        formatId: format.id,
        name: format.name,
        displayName: format.displayName,
        aspectRatio: format.aspectRatio,
        width: format.width,
        height: format.height,
        shopifyVariantId: variant.id,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
        availableForSale: variant.availableForSale,
      };
    })
    .filter((f): f is FormatOption => f !== null && f.availableForSale);
}
