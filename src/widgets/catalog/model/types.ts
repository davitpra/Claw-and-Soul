import { Product } from "@/entities/pet-product/model/types";

// Producto de entidad + los campos usados por los filtros del catálogo.
export type CatalogProduct = Product & {
  collection: string;
  /** Formato de entrega: template del backend (Digital, Canvas, Poster…); fallback al productType de Shopify. Vacío si ninguno. */
  productType: string;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado). Vacío si no está asignado. */
  artKind: string;
  /** Estilo de arte (vive en el backend, no en Shopify); vacío si el producto no tiene. */
  style: string;
  /** Dificultad del estilo (easy/medium/challenging); vacío si no tiene. */
  difficulty: string;
  priceAmount: number;
  onSale: boolean;
  /** Es el kit PBN dedicado seleccionado en el admin (único). Enlaza a /studio. */
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
  /** Formato de entrega del storefront (Digital | Canvas | Poster | Accessory | Credits; "PBN" es alias legacy de Digital). */
  template?: string | null;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); null si no está asignado. */
  artKind?: string | null;
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
  /** handle de Shopify → formato de entrega del backend (Digital | Canvas | Poster | Accessory | Credits). */
  templateByHandle: Map<string, string>;
  /** handle de Shopify → contenido de la obra ("pbn" | "print"). */
  artKindByHandle: Map<string, string>;
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
