"use client";

import { useEffect, useState } from "react";
import { Style, TemplateVarOption } from "@/entities/art-style/model/styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendStyle {
  id: string;
  name: string;
  displayName: string;
  previewUrl: string | null;
  templateVarOptions: Record<string, TemplateVarOption> | null;
  images: { imageUrl: string }[];
}

interface UseStyleResult {
  style: Style | null;
  isLoading: boolean;
  error: string | null;
}

export function useStyle(styleId: string | null): UseStyleResult {
  const [style, setStyle] = useState<Style | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!styleId) {
      setStyle(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/styles/${styleId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`styles error: ${res.status}`);
        const json = (await res.json()) as
          | { data: BackendStyle }
          | BackendStyle;
        return "data" in json ? json.data : json;
      })
      .then((data) => {
        if (cancelled) return;
        setStyle({
          id: data.id,
          name: data.displayName,
          img:
            data.previewUrl ??
            "https://placehold.co/400x500?text=Style",
          thanksUrl: null,
          templateVarOptions: data.templateVarOptions ?? null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useStyle error:", err);
        setError("Failed to load style.");
        setStyle(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [styleId]);

  return { style, isLoading, error };
}
