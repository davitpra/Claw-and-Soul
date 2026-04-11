import { useState, useEffect } from "react";
import { Style } from "@/entities/art-style/model/styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendStyle {
  id: string;
  name: string;
  displayName: string;
  isPremium: boolean;
  previewUrl: string | null;
  images: { imageUrl: string }[];
}

interface UseCompatStylesResult {
  styles: Style[];
  isLoading: boolean;
  error: string | null;
}

export function useCompatStyles(
  productRefId: string | null,
  formatId: string | null,
): UseCompatStylesResult {
  const [styles, setStyles] = useState<Style[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productRefId || !formatId) {
      setStyles([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(
      `${API_URL}/compat/styles?product_id=${productRefId}&format_id=${formatId}`,
      { credentials: "include" },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`compat/styles error: ${res.status}`);
        const json = (await res.json()) as
          | { data: BackendStyle[] }
          | BackendStyle[];
        return Array.isArray(json) ? json : json.data;
      })
      .then((data) => {
        if (cancelled) return;
        const mapped: Style[] = data.map((s) => ({
          id: s.id,
          name: s.displayName,
          label: s.isPremium ? "Premium" : undefined,
          img:
            s.images[0]?.imageUrl ??
            s.previewUrl ??
            "https://placehold.co/400x500?text=Style",
        }));
        setStyles(mapped);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useCompatStyles error:", err);
        setError("Failed to load compatible styles.");
        setStyles([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productRefId, formatId]);

  return { styles, isLoading, error };
}
