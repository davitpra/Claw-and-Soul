import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCTS } from "@/lib/shopify/queries/products";
import { Product } from "@/entities/pet-product/model/types";

// URL base de la API del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Producto del backend con su estilo asignado (GET /products lo incluye siempre).
interface BackendProduct {
  id: string;
  shopifyProductId: string;
  shopifyHandle: string | null;
  name: string;
  displayName: string;
  description: string | null;
  template: string | null;
  artKind: string | null;
  style?: {
    id: string;
    displayName: string;
  } | null;
}

// Interfaz que define la estructura del nodo de un producto desde GraphQL de Shopify
interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: { node: { url: string; altText: string | null } }[] };
}

// Interfaz para la respuesta de productos de Shopify
interface ShopifyProductsResponse {
  products: { edges: { node: ShopifyProductNode }[] };
}

interface UseSameStyleProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

// Resultado de una petición, atado a la clave de sus parámetros para poder
// derivar loading/vacío sin setState síncrono dentro del effect.
interface FetchResult {
  key: string;
  products: Product[];
  error: string | null;
}

/**
 * Obtiene los productos que comparten estilo con el producto actual.
 * Filtra los productos del backend por `style.id` (excluyendo el handle actual)
 * y los enriquece con imagen y precio de Shopify mediante merge por handle,
 * igual que `useBackendProducts`.
 */
export function useSameStyleProducts(
  styleId: string | null,
  excludeHandle?: string | null,
): UseSameStyleProductsResult {
  // Sin estilo no hay nada que buscar (producto sin estilo o aún resolviéndose).
  const key = styleId ? `${styleId}|${excludeHandle ?? ""}` : null;
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!key || !styleId) return;

    let cancelled = false;

    Promise.all([
      // 1. Productos configurados en nuestro backend (incluyen su estilo)
      fetch(`${API_URL}/products`, { credentials: "include" }).then(
        async (res) => {
          if (!res.ok) throw new Error(`products error: ${res.status}`);
          const json = (await res.json()) as
            | { data: BackendProduct[] }
            | BackendProduct[];
          return Array.isArray(json) ? json : json.data;
        },
      ),
      // 2. Detalles (precio, imagen) desde Shopify
      shopifyFetch<ShopifyProductsResponse>({
        query: GET_PRODUCTS,
        variables: { first: 100 },
      }).then((res) => res.data.products.edges.map((e) => e.node)),
    ])
      .then(([backendProducts, shopifyNodes]) => {
        if (cancelled) return;

        const shopifyByHandle = new Map<string, ShopifyProductNode>();
        for (const node of shopifyNodes) {
          shopifyByHandle.set(node.handle, node);
        }

        const merged: Product[] = backendProducts
          .filter(
            (bp) =>
              bp.style?.id === styleId &&
              bp.shopifyHandle &&
              bp.shopifyHandle !== excludeHandle &&
              // Solo productos con presencia real en Shopify (imagen/precio).
              shopifyByHandle.has(bp.shopifyHandle),
          )
          .map((bp) => {
            const shopify = shopifyByHandle.get(bp.shopifyHandle!)!;
            const minPrice = shopify.priceRange.minVariantPrice;
            const firstImage = shopify.images.edges[0]?.node.url;

            return {
              name: bp.displayName,
              desc: bp.description ?? "",
              price: minPrice
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: minPrice.currencyCode,
                  }).format(parseFloat(minPrice.amount))
                : "",
              img: firstImage ?? "https://placehold.co/400x300?text=Product",
              shopifyHandle: bp.shopifyHandle!,
              productRefId: bp.id,
              template: bp.template,
              artKind: bp.artKind,
            };
          });

        setResult({ key, products: merged, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useSameStyleProducts error:", err);
        setResult({ key, products: [], error: "Failed to load products." });
      });

    return () => {
      cancelled = true;
    };
  }, [key, styleId, excludeHandle]);

  // El resultado solo vale si corresponde a los parámetros actuales.
  const ready = result !== null && result.key === key;

  return {
    products: key && ready ? result.products : [],
    isLoading: Boolean(key) && !ready,
    error: key && ready ? result.error : null,
  };
}
