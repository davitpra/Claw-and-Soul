import { useState, useEffect } from "react";
import { Style, TemplateVarOption } from "@/entities/art-style/model/styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendStyle {
  id: string;
  name: string;
  displayName: string;
  previewUrl: string | null;
  thanksUrl: string | null;
  templateVarOptions: Record<string, TemplateVarOption> | null;
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
  // La combinación producto+formato se guarda junto al resultado: mientras
  // `state.key` no coincida con la key actual, la petición sigue en vuelo.
  // `isLoading` y el vaciado al cambiar de formato quedan derivados, así el
  // efecto no llama setState de forma síncrona
  // (react-hooks/set-state-in-effect).
  const key =
    productRefId && formatId ? `${productRefId}|${formatId}` : null;

  const [state, setState] = useState<{
    key: string | null;
    styles: Style[];
    error: string | null;
  }>({ key: null, styles: [], error: null });

  useEffect(() => {
    if (!productRefId || !formatId) return;

    let cancelled = false;

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
          img:
            s.previewUrl ??
            s.images[0]?.imageUrl ??
            "https://placehold.co/400x500?text=Style",
          thanksUrl: s.thanksUrl ?? null,
          templateVarOptions: s.templateVarOptions ?? null,
        }));
        setState({
          key: `${productRefId}|${formatId}`,
          styles: mapped,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useCompatStyles error:", err);
        setState({
          key: `${productRefId}|${formatId}`,
          styles: [],
          error: "Failed to load compatible styles.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [productRefId, formatId]);

  const settled = key !== null && state.key === key;

  return {
    styles: settled ? state.styles : [],
    isLoading: key !== null && !settled,
    error: settled ? state.error : null,
  };
}
