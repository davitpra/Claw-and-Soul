import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface UseProductShowcaseResult {
  collectionHandle: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Obtiene el handle de la colección destacada configurada para un producto
 * (campo showcaseCollectionHandle del backend), buscado por su handle de Shopify.
 * Se usa para mostrar dinámicamente la sección CollectionShowcase del producto.
 */
export function useProductShowcase(
  handle: string | null,
): UseProductShowcaseResult {
  const [collectionHandle, setCollectionHandle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setCollectionHandle(null);
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
        if (!res.ok) throw new Error(`product showcase error: ${res.status}`);
        const json = await res.json();
        const product = "data" in json ? json.data : json;
        return (product?.showcaseCollectionHandle as string | null) ?? null;
      })
      .then((value) => {
        if (cancelled) return;
        setCollectionHandle(value);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useProductShowcase error:", err);
        setError("Failed to load product showcase collection.");
        setCollectionHandle(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { collectionHandle, isLoading, error };
}
