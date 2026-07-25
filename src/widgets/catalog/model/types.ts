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

// Los datos de estilo/formato del backend viven en `entities/product` (los
// consume tanto el catálogo como el dashboard de órdenes). Se re-exportan aquí
// para no romper los imports existentes del catálogo.
export type {
  BackendProductLite,
  StyleData,
} from "@/entities/product/model/styleData";
