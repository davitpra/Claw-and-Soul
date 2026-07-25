import { useEffect, useState } from "react";
import { StyleDifficulty } from "@/entities/art-style/model/difficulty";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface UseProductStyleResult {
  styleId: string | null;
  styleName: string | null;
  difficulty: StyleDifficulty | null;
  isLoading: boolean;
  error: string | null;
}

interface ProductStyleData {
  styleId: string | null;
  styleName: string | null;
  difficulty: StyleDifficulty | null;
}

const EMPTY: ProductStyleData = {
  styleId: null,
  styleName: null,
  difficulty: null,
};

// El handle resuelto se guarda junto al resultado: mientras no coincida con el
// `handle` pedido, la petición sigue en vuelo. Eso hace derivables `isLoading`
// y el reset al cambiar de producto, de modo que el efecto no llama setState
// de forma síncrona (react-hooks/set-state-in-effect).
export function useProductStyle(handle: string | null): UseProductStyleResult {
  const [state, setState] = useState<{
    handle: string | null;
    data: ProductStyleData;
    error: string | null;
  }>({ handle: null, data: EMPTY, error: null });

  useEffect(() => {
    if (!handle) return;

    let cancelled = false;

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
        setState({
          handle,
          data: {
            styleId: style?.id ?? null,
            styleName: style?.displayName ?? null,
            difficulty: style?.difficulty ?? null,
          },
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useProductStyle error:", err);
        setState({
          handle,
          data: EMPTY,
          error: "Failed to load product style.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  const settled = handle !== null && state.handle === handle;
  const data = settled ? state.data : EMPTY;

  return {
    ...data,
    isLoading: handle !== null && !settled,
    error: settled ? state.error : null,
  };
}
