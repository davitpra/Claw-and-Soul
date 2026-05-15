import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCTS } from "@/lib/shopify/queries/products";
import { Product } from "@/entities/pet-product/model/types";

// URL base de la API del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Interfaz que define la estructura de un producto proveniente de nuestro backend
interface BackendProduct {
  id: string;
  shopifyProductId: string;
  shopifyHandle: string | null;
  name: string;
  displayName: string;
  description: string | null;
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

// Resultado esperado del hook
interface UseBackendProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener productos.
 * Realiza peticiones en paralelo a nuestro backend y a Shopify,
 * y luego combina los datos utilizando el "handle" de Shopify para
 * devolver una lista de productos unificada para el frontend.
 */
export function useBackendProducts(): UseBackendProductsResult {
  // Estados para almacenar los productos, el estado de carga y posibles errores
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Variable para evitar actualizaciones de estado si el componente se desmonta
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // Realizar ambas peticiones (backend local y Shopify) al mismo tiempo (en paralelo)
    Promise.all([
      // 1. Obtener productos configurados en nuestro backend
      fetch(`${API_URL}/products`, { credentials: "include" }).then(
        async (res) => {
          if (!res.ok) throw new Error(`products error: ${res.status}`);
          const json = (await res.json()) as
            | { data: BackendProduct[] }
            | BackendProduct[];
          return Array.isArray(json) ? json : json.data;
        },
      ),
      // 2. Obtener detalles de productos (precio, imagen) desde Shopify
      shopifyFetch<ShopifyProductsResponse>({
        query: GET_PRODUCTS,
        variables: { first: 100 },
      }).then((res) => res.data.products.edges.map((e) => e.node)),
    ])
      .then(([backendProducts, shopifyNodes]) => {
        if (cancelled) return;

        // Crear un mapa para buscar rápidamente los productos de Shopify por su handle
        const shopifyByHandle = new Map<string, ShopifyProductNode>();
        for (const node of shopifyNodes) {
          shopifyByHandle.set(node.handle, node);
        }

        // Combinar los datos del backend con los datos de Shopify
        const merged: Product[] = backendProducts
          // Solo procesar productos que tengan un handle de Shopify vinculado
          .filter((bp) => bp.shopifyHandle)
          .map((bp) => {
            const shopify = shopifyByHandle.get(bp.shopifyHandle!);
            const minPrice = shopify?.priceRange.minVariantPrice;
            const firstImage = shopify?.images.edges[0]?.node.url;

            // Retornar un objeto de Producto formateado para los componentes de UI
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
            };
          });

        // Actualizar el estado con los productos combinados
        setProducts(merged);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useBackendProducts error:", err);
        setError("Failed to load products.");
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Función de limpieza para cancelar actualizaciones si el componente se desmonta antes de finalizar
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, isLoading, error };
}
