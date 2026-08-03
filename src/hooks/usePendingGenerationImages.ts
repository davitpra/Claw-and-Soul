"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";

/**
 * Al montar, resuelve la imagen de los ítems del carrito cuya generación IA
 * todavía no había terminado cuando se agregaron. Los que siguen en proceso se
 * ignoran en silencio (la card del ítem muestra su propio estado de carga).
 */
export function usePendingGenerationImages() {
  const { items, updateItemImage } = useCart();
  const { authFetchJSON } = useAuthFetch();

  useEffect(() => {
    const pending = items.filter((i) => i.generationId && !i.imageUrl);

    pending.forEach(async (item) => {
      try {
        const statusRes = await authFetchJSON<{ data: { status: string } }>(
          `/generations/${item.generationId}/status`,
        );
        if (statusRes.data.status !== "completed") return;

        const detailRes = await authFetchJSON<{ data: { resultUrl: string } }>(
          `/generations/${item.generationId}`,
        );
        if (detailRes.data.resultUrl) {
          updateItemImage(item.generationId!, detailRes.data.resultUrl);
        }
      } catch {
        // generación no lista — se ignora
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
