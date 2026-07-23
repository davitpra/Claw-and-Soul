// El template del backend es el formato de entrega del storefront:
// Digital (descarga) | Canvas | Poster | Accessory | Credits.
// "PBN" es el valor legacy del formato digital: puede seguir llegando desde el
// productType de Shopify (fallback cuando un producto no tiene template propio),
// así que se normaliza a "Digital" en todos los consumidores.
export function normalizeTemplate(value?: string | null): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === "PBN" ? "Digital" : trimmed;
}

// User-facing copy for the delivery format (storefront is in English).
const TEMPLATE_LABELS: Record<string, string> = {
  Digital: "Digital Download",
  Canvas: "Canvas Print",
  Poster: "Poster Print",
  Credits: "Credits",
  Accessory: "Accessory",
};

/** Label visible del template. Devuelve el valor normalizado tal cual si no
 *  está mapeado, o "" si viene vacío. */
export function templateLabel(value?: string | null): string {
  const normalized = normalizeTemplate(value);
  return TEMPLATE_LABELS[normalized] ?? normalized;
}
