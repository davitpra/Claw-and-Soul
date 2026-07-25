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
  template?: string | null;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); null si no está asignado. */
  artKind?: string | null;
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
  // El handle resuelto se guarda junto al resultado: mientras no coincida con
  // el `handle` pedido, la petición sigue en vuelo. `isLoading` y el reset al
  // cambiar de producto son derivados, así el efecto no llama setState de forma
  // síncrona (react-hooks/set-state-in-effect).
  const [state, setState] = useState<{
    handle: string | null;
    product: BackendProductWithVariants | null;
    error: string | null;
  }>({ handle: null, product: null, error: null });

  useEffect(() => {
    if (!handle) return;

    let cancelled = false;

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
        setState({ handle, product: data, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useBackendProductVariants error:", err);
        setState({
          handle,
          product: null,
          error:
            err.message === "not_found"
              ? "This product is not available for personalization."
              : "Failed to load product variants.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  const settled = handle !== null && state.handle === handle;
  const product = settled ? state.product : null;

  return {
    product,
    variants: product?.variants ?? [],
    isLoading: handle !== null && !settled,
    error: settled ? state.error : null,
  };
}
