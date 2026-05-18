import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface UseProductStyleResult {
  styleId: string | null;
  styleName: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useProductStyle(handle: string | null): UseProductStyleResult {
  const [styleId, setStyleId] = useState<string | null>(null);
  const [styleName, setStyleName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setStyleId(null);
      setStyleName(null);
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
        if (!res.ok) throw new Error(`product style error: ${res.status}`);
        const json = await res.json();
        const product = "data" in json ? json.data : json;
        return product?.style ?? null;
      })
      .then((style) => {
        if (cancelled) return;
        setStyleId(style?.id ?? null);
        setStyleName(style?.displayName ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useProductStyle error:", err);
        setError("Failed to load product style.");
        setStyleId(null);
        setStyleName(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { styleId, styleName, isLoading, error };
}
