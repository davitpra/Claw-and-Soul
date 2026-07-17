import { useEffect, useState } from "react";
import { getCollectionProducts } from "@/lib/shopify/actions/collections";
import { Product } from "@/entities/pet-product/model/types";
import {
  DIFFICULTY_LABELS,
  StyleDifficulty,
} from "@/entities/art-style/model/difficulty";

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
  style: { difficulty: StyleDifficulty | null } | null;
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
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: { node: { url: string; altText: string | null } }[] };
}

// Resultado esperado del hook
interface UseCollectionProductsResult {
  products: Product[];
  title: string | null;
  description: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener los productos de una colección de Shopify.
 * Realiza peticiones en paralelo a nuestro backend y a la colección de Shopify,
 * y combina los datos por el "handle". Solo se incluyen los productos que
 * existen en el backend Y pertenecen a la colección indicada.
 */
export function useCollectionProducts(
  handle: string,
): UseCollectionProductsResult {
  // Estados para almacenar los productos, el estado de carga y posibles errores
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Variable para evitar actualizaciones de estado si el componente se desmonta
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // Realizar ambas peticiones (backend local y colección de Shopify) en paralelo
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
      // 2. Obtener la colección (título, descripción y productos) desde Shopify
      getCollectionProducts(handle, 100),
    ])
      .then(([backendProducts, collection]) => {
        if (cancelled) return;

        // Exponer el título y la descripción de la colección para la UI
        setTitle(collection?.title ?? null);
        setDescription(collection?.description ?? null);

        const shopifyNodes =
          (collection?.products.edges.map(
            (e) => e.node,
          ) as unknown as ShopifyProductNode[]) ?? [];

        // Crear un mapa para buscar rápidamente los productos de la colección por su handle
        const shopifyByHandle = new Map<string, ShopifyProductNode>();
        for (const node of shopifyNodes) {
          shopifyByHandle.set(node.handle, node);
        }

        // Combinar los datos del backend con los de la colección.
        // Solo se incluyen los productos del backend que pertenecen a la colección.
        const merged: Product[] = backendProducts
          .filter(
            (bp) => bp.shopifyHandle && shopifyByHandle.has(bp.shopifyHandle),
          )
          .map((bp) => {
            const shopify = shopifyByHandle.get(bp.shopifyHandle!)!;
            const minPrice = shopify.priceRange.minVariantPrice;
            const firstImage = shopify.images.edges[0]?.node.url;

            const formatMoney = (amount: string, currencyCode: string) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyCode,
              }).format(parseFloat(amount));

            // Precio comparativo (de lista): solo es oferta si supera al precio actual.
            const compareAt = shopify.compareAtPriceRange?.minVariantPrice;
            const priceAmount = minPrice ? parseFloat(minPrice.amount) : 0;
            const compareAmount = compareAt ? parseFloat(compareAt.amount) : 0;
            const onSale = compareAmount > priceAmount;

            // Retornar un objeto de Producto formateado para los componentes de UI
            return {
              name: bp.displayName,
              desc: bp.description ?? "",
              price: minPrice
                ? formatMoney(minPrice.amount, minPrice.currencyCode)
                : "",
              compareAtPrice: onSale
                ? formatMoney(compareAt!.amount, compareAt!.currencyCode)
                : undefined,
              discountPercent: onSale
                ? Math.round((1 - priceAmount / compareAmount) * 100)
                : undefined,
              img: firstImage ?? "https://placehold.co/400x300?text=Product",
              shopifyHandle: bp.shopifyHandle!,
              productRefId: bp.id,
              // Badge de la tarjeta: dificultad del estilo asociado al producto.
              label: bp.style?.difficulty
                ? DIFFICULTY_LABELS[bp.style.difficulty]
                : undefined,
            };
          });

        // Actualizar el estado con los productos combinados
        setProducts(merged);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useCollectionProducts error:", err);
        setError("Failed to load products.");
        setProducts([]);
        setTitle(null);
        setDescription(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Función de limpieza para cancelar actualizaciones si el componente se desmonta antes de finalizar
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { products, title, description, isLoading, error };
}
