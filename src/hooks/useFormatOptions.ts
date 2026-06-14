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

export interface ProductContextualImage {
  id: string;
  productFormatVariantId: string | null;
  shopifyVariantId: string | null; // GID of the variant, or null = General
  imageUrl: string;
  type: "scene" | "in_use" | "explainer" | "gallery";
  altImage: string | null;
  isPrimary: boolean;
  orderIndex: number;
}

interface BackendProductWithVariants {
  productRefId: string;
  shopifyProductId: string;
  shopifyHandle: string;
  name: string;
  displayName: string;
  description: string | null;
  style: { id: string } | null;
  variants: BackendProductVariant[];
  images: ProductContextualImage[];
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
  formats: FormatOption[];
  contextualImages: ProductContextualImage[];
  product: ShopifyProduct | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Backend is the source of truth for the variant↔format mapping.
 * Shopify Storefront API is used only for display data (price, availability).
 * Merge key is `shopifyVariantId` (GID), which backend normalizes.
 */
export function useFormatOptions(
  productHandle: string | null,
): UseFormatOptionsResult {
  const [productRefId, setProductRefId] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [contextualImages, setContextualImages] = useState<
    ProductContextualImage[]
  >([]);
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productHandle) {
      setProductRefId(null);
      setStyleId(null);
      setFormats([]);
      setContextualImages([]);
      setProduct(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

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

        if (!shopifyProduct) {
          setError(`Product '${productHandle}' not found in Shopify`);
          setProductRefId(backendProduct.productRefId);
          setStyleId(backendProduct.style?.id ?? null);
          setFormats([]);
          setContextualImages(backendProduct.images ?? []);
          setProduct(null);
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

        setProductRefId(backendProduct.productRefId);
        setStyleId(backendProduct.style?.id ?? null);
        setFormats(merged);
        setContextualImages(backendProduct.images ?? []);
        setProduct(shopifyProduct);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useFormatOptions error:", err);
        setError(
          err.message === "not_found"
            ? "This product is not available for personalization."
            : "Failed to load format options. Please try again.",
        );
        setProductRefId(null);
        setStyleId(null);
        setFormats([]);
        setContextualImages([]);
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productHandle]);

  return {
    productRefId,
    styleId,
    formats,
    contextualImages,
    product,
    isLoading,
    error,
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
