import { CatalogProduct } from "./types";

// Familias de producto en el orden en que aparecen en la primera fila de la barra
// del catálogo. Es un eje derivado: ningún campo lo trae hecho, porque "pbn" y
// "print" viven en `artKind` (el contenido) mientras que accesorios y créditos solo
// se distinguen por su `productType` (el formato). Los labels son propios de la
// barra; ART_KIND_LABELS sigue sirviendo al badge de las cards.
export const CATALOG_INTENTS = [
  { key: "pbn", title: "Paint by numbers" },
  { key: "print", title: "Print art" },
  { key: "accessory", title: "Accessories" },
  { key: "credits", title: "Credits" },
] as const;

// Familia preseleccionada al entrar: el coloreable de la mascota es el producto
// principal de la tienda.
export const DEFAULT_CATALOG_INTENT: string = "pbn";

/**
 * Familia a la que pertenece un producto, o "" si no encaja en ninguna (arte sin
 * el metafield `custom.art_kind`). Esos productos siguen siendo alcanzables desde
 * el chip "All", que no filtra por familia.
 */
export function productIntent(product: CatalogProduct): string {
  if (product.isCreditPack || product.productType === "Credits") {
    return "credits";
  }
  if (product.productType === "Accessory") return "accessory";
  // isPaintByNumbers cubre el legacy template "PBN", que normaliza a Digital y
  // puede no traer artKind.
  if (product.artKind === "pbn" || product.isPaintByNumbers) return "pbn";
  if (product.artKind === "print") return "print";
  return "";
}
