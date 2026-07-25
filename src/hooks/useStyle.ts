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

// El id resuelto se guarda junto al resultado: mientras no coincida con el
// `styleId` pedido, la petición sigue en vuelo. Así `isLoading` y el reset al
// cambiar de estilo son valores derivados y el efecto no llama setState de
// forma síncrona (react-hooks/set-state-in-effect).
interface StyleState {
  id: string | null;
  style: Style | null;
  error: string | null;
}

export function useStyle(styleId: string | null): UseStyleResult {
  const [state, setState] = useState<StyleState>({
    id: null,
    style: null,
    error: null,
  });

  useEffect(() => {
    if (!styleId) return;

    let cancelled = false;

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
        setState({
          id: styleId,
          style: {
            id: data.id,
            name: data.displayName,
            img:
              data.previewUrl ??
              "https://placehold.co/400x500?text=Style",
            thanksUrl: null,
            templateVarOptions: data.templateVarOptions ?? null,
          },
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useStyle error:", err);
        setState({ id: styleId, style: null, error: "Failed to load style." });
      });

    return () => {
      cancelled = true;
    };
  }, [styleId]);

  const settled = styleId !== null && state.id === styleId;

  return {
    style: settled ? state.style : null,
    isLoading: styleId !== null && !settled,
    error: settled ? state.error : null,
  };
}
