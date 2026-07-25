import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const NEW_COLLECTION_STYLE_ID = "49e60bb9-20af-4a01-b30f-3a288a6cabcb";

export interface StyleImage {
  id: string;
  styleId: string;
  imageUrl: string;
  storageKey: string;
  altImage: string | null;
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

  // El id resuelto viaja con el resultado: mientras `state.id` no coincida con
  // `resolvedId`, la petición sigue en vuelo. `isLoading` y el vaciado de la
  // lista al cambiar de estilo quedan derivados, así el efecto no llama
  // setState de forma síncrona (react-hooks/set-state-in-effect).
  const [state, setState] = useState<{
    id: string | null;
    images: StyleImage[];
    error: string | null;
  }>({ id: null, images: [], error: null });

  useEffect(() => {
    if (!resolvedId) return;

    let cancelled = false;

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
        setState({ id: resolvedId, images: data, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useStyleImages error:", err);
        setState({
          id: resolvedId,
          images: [],
          error: "Failed to load images.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  const settled = resolvedId !== null && state.id === resolvedId;

  return {
    images: settled ? state.images : [],
    isLoading: resolvedId !== null && !settled,
    error: settled ? state.error : null,
  };
}
