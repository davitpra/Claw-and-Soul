"use client";

import { useEffect, useState } from "react";
import type { InputOptionsInit } from "./useInputOptions";
import type { RenderOptionsInit } from "./useRenderOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface StylePbnConfig {
  input?: InputOptionsInit;
  render?: RenderOptionsInit;
}

interface UseStylePbnConfigResult {
  inputInit?: InputOptionsInit;
  renderInit?: RenderOptionsInit;
  loading: boolean;
}

/**
 * Fetches the PBN default config saved on a style (`Style.pbnConfig`) so the
 * studio can seed its options with it. Errors resolve to undefined inits — the
 * studio must always be able to start with its built-in defaults.
 */
export function useStylePbnConfig(
  styleId: string | null,
): UseStylePbnConfigResult {
  // `loading` se deriva comparando el styleId resuelto con el pedido, así el
  // effect solo hace setState al completar el fetch.
  const [resolved, setResolved] = useState<{
    styleId: string;
    config?: StylePbnConfig;
  } | null>(null);

  useEffect(() => {
    if (!styleId) return;

    let cancelled = false;
    fetch(`${API_URL}/styles/${styleId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`styles error: ${res.status}`);
        const json = (await res.json()) as
          | { data: { pbnConfig?: StylePbnConfig | null } }
          | { pbnConfig?: StylePbnConfig | null };
        const data = "data" in json ? json.data : json;
        return data.pbnConfig ?? undefined;
      })
      .then((config) => {
        if (!cancelled) setResolved({ styleId, config });
      })
      .catch((err) => {
        console.error("useStylePbnConfig error:", err);
        if (!cancelled) setResolved({ styleId });
      });

    return () => {
      cancelled = true;
    };
  }, [styleId]);

  if (!styleId) return { loading: false };
  if (resolved?.styleId !== styleId) return { loading: true };
  return {
    inputInit: resolved.config?.input,
    renderInit: resolved.config?.render,
    loading: false,
  };
}
