import { Product } from "@/entities/pet-product/model/types";

// Producto de entidad + los campos usados por los filtros del shop.
export type ShopProduct = Product & {
  collection: string;
  /** Tipo de producto: template del backend (Canvas, Poster, PBN…); fallback al productType de Shopify. Vacío si ninguno. */
  productType: string;
  /** Estilo de arte (vive en el backend, no en Shopify); vacío si el producto no tiene. */
  style: string;
  /** Dificultad del estilo (easy/medium/challenging); vacío si no tiene. */
  difficulty: string;
  priceAmount: number;
  onSale: boolean;
  /** Es el kit PBN dedicado seleccionado en el admin (único). Enlaza a /paint-by-numbers. */
  isPbnKit: boolean;
  /** Es el producto Credit Pack dedicado seleccionado en el admin (único). Enlaza a /credits. */
  isCreditPack: boolean;
};

// Producto del backend, del que solo nos interesa su handle de Shopify y su estilo.
export interface BackendProductLite {
  shopifyHandle: string | null;
  /** Kit PBN dedicado (el genérico "custom paint by numbers"). */
  isPaintByNumbers?: boolean;
  /** Producto dedicado a la venta de créditos (único). */
  isCreditPack?: boolean;
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
  /** handle de Shopify → template del backend (Canvas | Poster | PBN | Accessory | Credits). */
  templateByHandle: Map<string, string>;
  /** handle de Shopify → dificultad del estilo del producto. */
  difficultyByHandle: Map<string, string>;
  /** handles de Shopify que corresponden a kits Paint-by-Numbers. */
  pbnHandles: Set<string>;
  /** handle del kit PBN dedicado (el único marcado en el admin); null si no hay. */
  pbnKitHandle: string | null;
  /** handle del producto Credit Pack dedicado (el único marcado en el admin); null si no hay. */
  creditPackHandle: string | null;
  /** nombre del estilo → categoría a la que pertenece. */
  categoryByStyle: Map<string, string>;
}
