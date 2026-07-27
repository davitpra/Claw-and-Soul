import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

/** Un valor elegible de una opción de Shopify para la variante actual. */
export interface OptionValue {
  value: string;
  disabled: boolean;
}

/**
 * Nombre real (con su capitalización) de una opción del producto, buscándola por
 * su nombre en minúsculas; `null` si el producto no la tiene.
 */
export function getOptionName(
  product: ShopifyProduct,
  lowerName: string,
): string | null {
  const names = product.variants.edges[0]?.node.selectedOptions ?? [];
  return names.find((o) => o.name.toLowerCase() === lowerName)?.name ?? null;
}

export function optionsOf(variant: ShopifyVariant | undefined) {
  const result: Record<string, string> = {};
  variant?.selectedOptions.forEach((o) => {
    result[o.name] = o.value;
  });
  return result;
}

/**
 * Un producto puede combinar varias opciones (tamaño, tipo, color…). Sólo son
 * elegibles las variantes que coinciden con la seleccionada en todo *menos* la
 * opción que se está cambiando; si no, cambiar de talla saltaría también de tipo.
 */
export function matchesSiblings(
  variant: ShopifyVariant,
  current: Record<string, string>,
  optionName: string,
) {
  return variant.selectedOptions.every(
    (o) =>
      o.name === optionName ||
      current[o.name] === undefined ||
      current[o.name] === o.value,
  );
}

/**
 * Valores disponibles de una opción para la variante seleccionada, en el orden
 * en que Shopify devuelve las variantes y sin repetir.
 */
export function buildOptionValues(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  optionName: string,
): OptionValue[] {
  const current = optionsOf(selectedVariant);
  const seen = new Set<string>();
  const values: OptionValue[] = [];

  for (const { node } of product.variants.edges) {
    const value = node.selectedOptions.find(
      (o) => o.name === optionName,
    )?.value;
    if (!value || seen.has(value)) continue;
    if (!matchesSiblings(node, current, optionName)) continue;

    seen.add(value);
    values.push({ value, disabled: !node.availableForSale });
  }

  return values;
}

/** Variante que corresponde a un valor de la opción manteniendo el resto. */
export function findVariantForOption(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  optionName: string,
  value: string,
): ShopifyVariant | null {
  const current = optionsOf(selectedVariant);

  return (
    product.variants.edges.find(
      ({ node }) =>
        node.selectedOptions.some(
          (o) => o.name === optionName && o.value === value,
        ) && matchesSiblings(node, current, optionName),
    )?.node ?? null
  );
}
