import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const NEW_COLLECTION_STYLE_ID = "ac3c581d-a560-4400-9bd7-11c959b2942f";

export interface StyleImage {
  id: string;
  styleId: string;
  imageUrl: string;
  storageKey: string;
  caption: string | null;
  orderIndex: number;
  isPrimary: boolean;
  createdAt: string;
}

interface UseStyleImagesResult {
  images: StyleImage[];
  isLoading: boolean;
  error: string | null;
}

export function useStyleImages(styleId?: string | null): UseStyleImagesResult {
  const resolvedId =
    styleId === undefined ? NEW_COLLECTION_STYLE_ID : (styleId ?? null);

  const [images, setImages] = useState<StyleImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedId) return;

    let cancelled = false;
    setIsLoading(true);
    setImages([]);
    setError(null);

    fetch(`${API_URL}/styles/${resolvedId}/images`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`style images error: ${res.status}`);
        const json = (await res.json()) as
          | { data: StyleImage[] }
          | StyleImage[];
        return Array.isArray(json) ? json : json.data;
      })
      .then((data) => {
        if (cancelled) return;
        setImages(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useStyleImages error:", err);
        setError("Failed to load images.");
        setImages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  return { images, isLoading, error };
}
