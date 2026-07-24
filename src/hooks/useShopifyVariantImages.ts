"use client";

import { useEffect, useMemo, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCT } from "@/lib/shopify/queries/products";

// Los ids de Shopify son GIDs (gid://shopify/ProductVariant/123). Los ítems de
// orden guardan solo el id numérico, así que normalizamos a numérico para poder
// cruzarlos con el mapa de imágenes.
export function variantNumericId(id: string | null | undefined): string | null {
  if (!id) return null;
  return id.split("/").pop() ?? id;
}

type ProductVariantsImages = {
  product: {
    variants: {
      edges: Array<{
        node: { id: string; image: { url: string } | null };
      }>;
    };
  } | null;
};

/**
 * Resuelve, best-effort, la imagen live de Shopify de cada variante para el
 * conjunto de `handles` de producto dado. Devuelve un mapa
 * `variantNumericId → image.url`. Mismo mecanismo que usa el admin en la vista de
 * detalle de orden; pensado para ítems sin imagen persistida (accesorios).
 *
 * El fetch corre en paralelo por handle deduplicado y no bloquea el render: el
 * mapa arranca vacío y se completa cuando Shopify responde.
 */
export function useShopifyVariantImages(
  handles: (string | null | undefined)[],
): Record<string, string> {
  // Clave estable para el efecto: handles únicos, no vacíos y ordenados. Evita
  // refetch cuando el array llega con el mismo contenido en otro orden/identidad.
  const key = useMemo(() => {
    return Array.from(
      new Set(handles.filter((h): h is string => !!h)),
    )
      .sort()
      .join(",");
  }, [handles]);

  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    // Sin handles el resultado es un mapa vacío; el set pasa por la vía async
    // (microtask) para no llamar setState de forma síncrona dentro del efecto.
    const uniqueHandles = key ? key.split(",") : [];

    (async () => {
      const byVariant: Record<string, string> = {};
      await Promise.all(
        uniqueHandles.map(async (handle) => {
          try {
            const { data } = await shopifyFetch<ProductVariantsImages>({
              query: GET_PRODUCT,
              variables: { handle },
            });
            for (const { node } of data.product?.variants.edges ?? []) {
              const numericId = variantNumericId(node.id);
              if (node.image && numericId) {
                byVariant[numericId] = node.image.url;
              }
            }
          } catch {
            // best-effort: sin imagen para este handle
          }
        }),
      );
      if (active) setImages(byVariant);
    })();

    return () => {
      active = false;
    };
  }, [key]);

  return images;
}
