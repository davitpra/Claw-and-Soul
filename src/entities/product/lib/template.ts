// El template del backend es el formato de entrega del storefront:
// Digital (descarga) | Canvas | Poster | Accessory | Credits.
// "PBN" es el valor legacy del formato digital: puede seguir llegando desde el
// productType de Shopify (fallback cuando un producto no tiene template propio),
// así que se normaliza a "Digital" en todos los consumidores.
export function normalizeTemplate(value?: string | null): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === "PBN" ? "Digital" : trimmed;
}
