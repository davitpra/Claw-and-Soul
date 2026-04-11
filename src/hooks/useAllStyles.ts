import { useEffect, useState } from "react";
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

interface UseAllStylesResult {
  styles: Style[];
  isLoading: boolean;
  error: string | null;
}

export function useAllStyles(): UseAllStylesResult {
  const [styles, setStyles] = useState<Style[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/styles`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`styles error: ${res.status}`);
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
        console.error("useAllStyles error:", err);
        setError("Failed to load styles.");
        setStyles([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { styles, isLoading, error };
}
