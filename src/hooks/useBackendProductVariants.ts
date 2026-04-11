import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface BackendProductVariant {
  shopifyVariantId: string;
  shopifyVariantTitle: string;
  formatId: string;
  formatName: string;
  formatDisplayName: string;
  aspectRatio: string;
  width: number;
  height: number;
}

export interface BackendProductWithVariants {
  productRefId: string;
  shopifyProductId: string;
  shopifyHandle: string;
  name: string;
  displayName: string;
  description: string | null;
  variants: BackendProductVariant[];
}

interface UseBackendProductVariantsResult {
  product: BackendProductWithVariants | null;
  variants: BackendProductVariant[];
  isLoading: boolean;
  error: string | null;
}

export function useBackendProductVariants(
  handle: string | null,
): UseBackendProductVariantsResult {
  const [product, setProduct] = useState<BackendProductWithVariants | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setProduct(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/products/${encodeURIComponent(handle)}/variants`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 404) {
          throw new Error("not_found");
        }
        if (!res.ok) {
          throw new Error(`products/${handle}/variants error: ${res.status}`);
        }
        const json = (await res.json()) as
          | { data: BackendProductWithVariants }
          | BackendProductWithVariants;
        return "data" in json ? json.data : json;
      })
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useBackendProductVariants error:", err);
        setError(
          err.message === "not_found"
            ? "This product is not available for personalization."
            : "Failed to load product variants.",
        );
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return {
    product,
    variants: product?.variants ?? [],
    isLoading,
    error,
  };
}
