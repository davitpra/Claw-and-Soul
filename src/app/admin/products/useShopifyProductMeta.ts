import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";

const GET_PRODUCTS_META = `
  query getProductsMeta($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          productType
          images(first: 1) {
            edges {
              node { url }
            }
          }
        }
      }
    }
  }
`;

type ProductsMetaResponse = {
  products: {
    edges: Array<{
      node: {
        handle: string;
        productType: string | null;
        images: { edges: Array<{ node: { url: string } }> };
      };
    }>;
  };
};

/**
 * Trae en vivo del Storefront de Shopify los metadatos que el backend no guarda:
 * la miniatura y el `productType` de cada producto, indexados por handle.
 *
 * Es la única excepción admitida a "las páginas admin no llaman a fetch directo"
 * (ver ARCHITECTURE.md §6): es best-effort y no bloquea la UI si falla.
 */
export function useShopifyProductMeta() {
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [productTypeMap, setProductTypeMap] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await shopifyFetch<ProductsMetaResponse>({
          query: GET_PRODUCTS_META,
          variables: { first: 250 },
        });
        if (cancelled) return;

        const images: Record<string, string> = {};
        const types: Record<string, string> = {};
        for (const { node } of data.products.edges) {
          const url = node.images.edges[0]?.node.url;
          if (url) images[node.handle] = url;
          const type = node.productType?.trim();
          if (type) types[node.handle] = type;
        }
        setImageMap(images);
        setProductTypeMap(types);
      } catch {
        // metadatos de Shopify best-effort — no bloquear la UI si falla
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { imageMap, productTypeMap };
}
