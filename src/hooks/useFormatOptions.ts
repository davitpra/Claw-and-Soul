import { useState, useEffect } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";
import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";

export type { ShopifyProduct };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendProductVariant {
  shopifyVariantId: string;
  shopifyVariantTitle: string;
  formatId: string;
  formatName: string;
  formatDisplayName: string;
  aspectRatio: string;
  width: number;
  height: number;
}

interface BackendProductWithVariants {
  productRefId: string;
  shopifyProductId: string;
  shopifyHandle: string;
  name: string;
  displayName: string;
  description: string | null;
  style: { id: string } | null;
  template: string | null;
  variants: BackendProductVariant[];
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
  productRefId: string | null;
  styleId: string | null;
  template: string | null;
  formats: FormatOption[];
  product: ShopifyProduct | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Backend is the source of truth for the variant↔format mapping.
 * Shopify Storefront API is used only for display data (price, availability).
 * Merge key is `shopifyVariantId` (GID), which backend normalizes.
 */
interface FormatOptionsData {
  productRefId: string | null;
  styleId: string | null;
  template: string | null;
  formats: FormatOption[];
  product: ShopifyProduct | null;
}

const EMPTY: FormatOptionsData = {
  productRefId: null,
  styleId: null,
  template: null,
  formats: [],
  product: null,
};

export function useFormatOptions(
  productHandle: string | null,
): UseFormatOptionsResult {
  // El handle resuelto se guarda junto al resultado: mientras `state.handle` no
  // coincida con el `productHandle` pedido, la petición sigue en vuelo. Eso hace
  // derivables `isLoading` y el reset al cambiar de producto, así el efecto no
  // llama setState de forma síncrona (react-hooks/set-state-in-effect).
  const [state, setState] = useState<{
    handle: string | null;
    data: FormatOptionsData;
    error: string | null;
  }>({ handle: null, data: EMPTY, error: null });

  useEffect(() => {
    if (!productHandle) return;

    let cancelled = false;

    Promise.all([
      fetch(
        `${API_URL}/products/${encodeURIComponent(productHandle)}/variants`,
        { credentials: "include" },
      ).then(async (res) => {
        if (res.status === 404) throw new Error("not_found");
        if (!res.ok) throw new Error(`backend variants error: ${res.status}`);
        const json = (await res.json()) as
          | { data: BackendProductWithVariants }
          | BackendProductWithVariants;
        return "data" in json ? json.data : json;
      }),

      shopifyFetch<{ product: ShopifyProduct }>({
        query: GET_PRODUCT,
        variables: { handle: productHandle },
      }).then((res) => res.data.product),
    ])
      .then(([backendProduct, shopifyProduct]) => {
        if (cancelled) return;

        // Error parcial: el backend sí conoce el producto, pero Shopify no lo
        // devuelve. Se conservan los datos del backend junto con el error.
        if (!shopifyProduct) {
          setState({
            handle: productHandle,
            data: {
              productRefId: backendProduct.productRefId,
              styleId: backendProduct.style?.id ?? null,
              template: backendProduct.template ?? null,
              formats: [],
              product: null,
            },
            error: `Product '${productHandle}' not found in Shopify`,
          });
          return;
        }

        const variantMap = new Map<string, ShopifyVariant>();
        for (const edge of shopifyProduct.variants.edges) {
          variantMap.set(edge.node.id, edge.node);
        }

        const merged = mergeBackendVariantsWithShopify(
          backendProduct.variants,
          variantMap,
        );

        setState({
          handle: productHandle,
          data: {
            productRefId: backendProduct.productRefId,
            styleId: backendProduct.style?.id ?? null,
            template: backendProduct.template ?? null,
            formats: merged,
            product: shopifyProduct,
          },
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useFormatOptions error:", err);
        setState({
          handle: productHandle,
          data: EMPTY,
          error:
            err.message === "not_found"
              ? "This product is not available for personalization."
              : "Failed to load format options. Please try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [productHandle]);

  const settled = productHandle !== null && state.handle === productHandle;

  return {
    ...(settled ? state.data : EMPTY),
    isLoading: productHandle !== null && !settled,
    error: settled ? state.error : null,
  };
}

function mergeBackendVariantsWithShopify(
  backendVariants: BackendProductVariant[],
  variantMap: Map<string, ShopifyVariant>,
): FormatOption[] {
  return backendVariants
    .map((bv) => {
      const variant = variantMap.get(bv.shopifyVariantId);
      if (!variant) return null;

      return {
        formatId: bv.formatId,
        name: bv.formatName,
        displayName: bv.formatDisplayName,
        aspectRatio: bv.aspectRatio,
        width: bv.width,
        height: bv.height,
        shopifyVariantId: variant.id,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
        availableForSale: variant.availableForSale,
      };
    })
    .filter((f): f is FormatOption => f !== null && f.availableForSale);
}
