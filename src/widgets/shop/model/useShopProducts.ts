import { useEffect, useState } from "react";
import { getProducts } from "@/lib/shopify";
import { fetchStyles } from "./fetchStyles";
import { ShopProduct, StyleData } from "./types";

// Formatea un monto como moneda (p. ej. "$42.00").
function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(parseFloat(amount));
}

// Convierte un nodo de Shopify (+ estilos del backend) en un ShopProduct.
function toShopProduct(
  node: Awaited<ReturnType<typeof getProducts>>[number],
  styleData: StyleData,
): ShopProduct {
  const price = node.priceRange?.minVariantPrice || {
    amount: "0.00",
    currencyCode: "USD",
  };
  const collection = node.collections?.edges?.[0]?.node.title || "Other";

  // Precio comparativo (de lista): solo es oferta si supera al precio actual.
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const priceAmount = parseFloat(price.amount);
  const compareAmount = compareAt ? parseFloat(compareAt.amount) : 0;
  const onSale = compareAmount > priceAmount;

  return {
    name: node.title,
    desc: node.description || "AI Personalized Pet Art",
    price: `${formatMoney(price.amount, price.currencyCode)} ${price.currencyCode}`,
    compareAtPrice: onSale
      ? formatMoney(compareAt!.amount, compareAt!.currencyCode)
      : undefined,
    discountPercent: onSale
      ? Math.round((1 - priceAmount / compareAmount) * 100)
      : undefined,
    img: node.images.edges[0]?.node.url || "/placeholder-image.jpg",
    shopifyHandle: node.handle,
    label: collection,
    collection,
    productType: node.productType?.trim() ?? "",
    style: styleData.byHandle.get(node.handle) ?? "",
    difficulty: styleData.difficultyByHandle.get(node.handle) ?? "",
    priceAmount,
    onSale,
  };
}

export interface ShopProductsState {
  products: ShopProduct[];
  loading: boolean;
  /** Colecciones únicas presentes en el catálogo. */
  collections: string[];
  /** nombre del estilo → categoría a la que pertenece. */
  styleCategories: Map<string, string>;
}

/**
 * Carga el catálogo del shop: Shopify da los productos y el backend el estilo
 * de arte de cada uno. Se recarga cuando cambia la búsqueda.
 */
export function useShopProducts(searchQuery: string): ShopProductsState {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<string[]>([]);
  const [styleCategories, setStyleCategories] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    setLoading(true);

    async function fetchProducts() {
      try {
        const [fetchedData, styleData] = await Promise.all([
          getProducts(20, searchQuery || undefined),
          fetchStyles(),
        ]);

        const mappedProducts = fetchedData.map((node) =>
          toShopProduct(node, styleData),
        );

        setProducts(mappedProducts);
        setStyleCategories(styleData.categoryByStyle);
        setCollections(
          Array.from(new Set(mappedProducts.map((p) => p.collection))),
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchQuery]);

  return { products, loading, collections, styleCategories };
}
