import { CatalogProduct } from "./types";

// Secciones del catálogo en el orden en que se muestran. La `key` es el `productType`
// (template del backend = formato de entrega; "Digital" son las descargas del
// coloreable de la mascota); el `title` es el encabezado visible. Ver los valores
// canónicos en admin `ProductsTable` (TEMPLATE_OPTIONS) y `ProductPageTemplate`.
// El contenido (coloreable PBN vs arte terminado) es un eje aparte: `artKind`.
export const CATALOG_SECTIONS = [
  { key: "Digital", title: "Digital Downloads" },
  { key: "Canvas", title: "Canvas" },
  { key: "Poster", title: "Posters" },
  { key: "Accessory", title: "Accessories" },
  { key: "Credits", title: "Credits" },
] as const;

// Los productos sin un tipo reconocido (productType vacío o fuera de CATALOG_SECTIONS)
// caen en esta sección, que siempre va al final.
export const OTHER_SECTION = { key: "__other__", title: "Other" } as const;

// Tipo preseleccionado al entrar al catálogo: los coloreables digitales son el
// producto principal, así que se muestran solos hasta que el visitante toque otro
// chip (o deseleccione este) para ver el catálogo completo.
export const DEFAULT_CATALOG_TYPE: string = "Digital";

export interface CatalogSectionGroup {
  key: string;
  title: string;
  products: CatalogProduct[];
}

/**
 * Agrupa los productos en las secciones de CATALOG_SECTIONS (en orden) más una
 * sección "Other" al final para los que no encajen en ninguna. Se omiten las
 * secciones vacías, por lo que con filtros/búsqueda solo aparecen las que tienen
 * productos.
 */
export function groupIntoSections(products: CatalogProduct[]): CatalogSectionGroup[] {
  const knownKeys = new Set<string>(CATALOG_SECTIONS.map((s) => s.key));

  const groups: CatalogSectionGroup[] = CATALOG_SECTIONS.map((section) => ({
    key: section.key,
    title: section.title,
    products: products.filter((p) => p.productType === section.key),
  }));

  const other = products.filter((p) => !knownKeys.has(p.productType));
  if (other.length > 0) {
    groups.push({ ...OTHER_SECTION, products: other });
  }

  return groups.filter((group) => group.products.length > 0);
}
