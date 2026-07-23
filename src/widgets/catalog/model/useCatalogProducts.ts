import { useEffect, useState } from "react";
import { normalizeTemplate } from "@/entities/product/lib/template";
import { getProducts } from "@/lib/shopify";
import { getCollectionProducts } from "@/lib/shopify/actions/collections";
import { ShopifyProduct } from "@/lib/shopify/types";
import { fetchStyles } from "./fetchStyles";
import { CatalogProduct, StyleData } from "./types";

// Formatea un monto como moneda (p. ej. "$42.00").
function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(parseFloat(amount));
}

// Convierte un nodo de Shopify (+ estilos del backend) en un CatalogProduct.
// `collectionTitle` es la colección que se está navegando: cuando la hay, es la
// etiqueta correcta para la card. Sin ella (catálogo completo o búsqueda) no
// existe una "colección principal", así que se cae a la primera que devuelva
// Shopify, que es arbitraria.
function toCatalogProduct(
  node: ShopifyProduct,
  styleData: StyleData,
  collectionTitle?: string,
): CatalogProduct {
  const price = node.priceRange?.minVariantPrice || {
    amount: "0.00",
    currencyCode: "USD",
  };
  const collection =
    collectionTitle || node.collections?.edges?.[0]?.node.title || "Other";

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
    productType:
      styleData.templateByHandle.get(node.handle) ??
      normalizeTemplate(node.productType),
    artKind: styleData.artKindByHandle.get(node.handle) ?? "",
    style: styleData.byHandle.get(node.handle) ?? "",
    difficulty: styleData.difficultyByHandle.get(node.handle) ?? "",
    isPaintByNumbers: styleData.pbnHandles.has(node.handle),
    isPbnKit: node.handle === styleData.pbnKitHandle,
    isCreditPack: node.handle === styleData.creditPackHandle,
    priceAmount,
    onSale,
  };
}

export interface CatalogProductsState {
  products: CatalogProduct[];
  loading: boolean;
  /** Título de la colección navegada; null en el catálogo completo o si el handle no existe. */
  collectionTitle: string | null;
  /** nombre del estilo → categoría a la que pertenece. */
  styleCategories: Map<string, string>;
}

// Cuántos productos pedir por vista.
const PAGE_SIZE = 20;
const COLLECTION_PAGE_SIZE = 100;

/**
 * Carga el catálogo: Shopify da los productos y el backend el estilo
 * de arte de cada uno. Se recarga cuando cambia la búsqueda o la colección.
 *
 * La colección se resuelve en el servidor (`collection(handle:)`), no filtrando
 * en cliente: es Shopify quien decide la pertenencia, así que un producto en
 * varias colecciones aparece en todas. `collectionHandle` vacío trae el catálogo
 * completo. La búsqueda tiene prioridad: la Storefront API no admite buscar
 * texto dentro de una colección, y `?q=` siempre llega desde el navbar, que no
 * arrastra la categoría.
 */
export function useCatalogProducts(
  searchQuery: string,
  collectionHandle: string = "",
): CatalogProductsState {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionTitle, setCollectionTitle] = useState<string | null>(null);
  const [styleCategories, setStyleCategories] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Trae los productos de la colección o los del catálogo/búsqueda, según el
    // caso. Un handle inexistente devuelve null y se trata como colección vacía
    // en vez de caer al catálogo completo, para no mostrar lo que nadie pidió.
    async function loadNodes(): Promise<{
      nodes: ShopifyProduct[];
      title: string | null;
    }> {
      if (!searchQuery && collectionHandle) {
        const collection = await getCollectionProducts(
          collectionHandle,
          COLLECTION_PAGE_SIZE,
        );
        return {
          nodes: collection?.products.edges.map((edge) => edge.node) ?? [],
          title: collection?.title ?? null,
        };
      }
      return {
        nodes: await getProducts(PAGE_SIZE, searchQuery || undefined),
        title: null,
      };
    }

    async function fetchProducts() {
      try {
        const [{ nodes, title }, styleData] = await Promise.all([
          loadNodes(),
          fetchStyles(),
        ]);
        if (cancelled) return;

        setProducts(
          nodes.map((node) => toCatalogProduct(node, styleData, title ?? undefined)),
        );
        setCollectionTitle(title);
        setStyleCategories(styleData.categoryByStyle);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, collectionHandle]);

  return { products, loading, collectionTitle, styleCategories };
}
