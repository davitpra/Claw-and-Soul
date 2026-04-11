import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCTS } from "@/lib/shopify/queries/products";
import { Product } from "@/entities/pet-product/model/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface BackendProduct {
  id: string;
  shopifyProductId: string;
  shopifyHandle: string | null;
  name: string;
  displayName: string;
  description: string | null;
}

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

interface ShopifyProductsResponse {
  products: { edges: { node: ShopifyProductNode }[] };
}

interface UseBackendProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function useBackendProducts(): UseBackendProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_URL}/products`, { credentials: "include" }).then(
        async (res) => {
          if (!res.ok) throw new Error(`products error: ${res.status}`);
          const json = (await res.json()) as
            | { data: BackendProduct[] }
            | BackendProduct[];
          return Array.isArray(json) ? json : json.data;
        },
      ),
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
          .filter((bp) => bp.shopifyHandle)
          .map((bp) => {
            const shopify = shopifyByHandle.get(bp.shopifyHandle!);
            const minPrice = shopify?.priceRange.minVariantPrice;
            const firstImage = shopify?.images.edges[0]?.node.url;

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

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, isLoading, error };
}
