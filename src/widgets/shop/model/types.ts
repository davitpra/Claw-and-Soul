import { Product } from "@/entities/pet-product/model/types";

// Producto de entidad + los campos usados por los filtros del shop.
export type ShopProduct = Product & {
  collection: string;
  /** Shopify productType (Canvas, Poster…); vacío si no está configurado. */
  productType: string;
  /** Estilo de arte (vive en el backend, no en Shopify); vacío si el producto no tiene. */
  style: string;
  /** Dificultad del estilo (easy/medium/challenging); vacío si no tiene. */
  difficulty: string;
  priceAmount: number;
  onSale: boolean;
};

// Producto del backend, del que solo nos interesa su handle de Shopify y su estilo.
export interface BackendProductLite {
  shopifyHandle: string | null;
  /** Kit PBN dedicado (el genérico "custom paint by numbers"). */
  isPaintByNumbers?: boolean;
  /** Template del storefront; "PBN" marca los kits Paint-by-Numbers por estilo. */
  template?: string | null;
  style?: {
    id: string;
    displayName: string;
    category?: string;
    difficulty?: string | null;
  } | null;
}

// Estilos resueltos desde el backend: datos por handle + categoría por estilo.
export interface StyleData {
  /** handle de Shopify → nombre del estilo del producto. */
  byHandle: Map<string, string>;
  /** handle de Shopify → dificultad del estilo del producto. */
  difficultyByHandle: Map<string, string>;
  /** handles de Shopify que corresponden a kits Paint-by-Numbers. */
  pbnHandles: Set<string>;
  /** nombre del estilo → categoría a la que pertenece. */
  categoryByStyle: Map<string, string>;
}
