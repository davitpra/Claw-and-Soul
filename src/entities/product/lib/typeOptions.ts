import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import type { ChipOption } from "@/shared/ui/OptionChips";
import {
  buildOptionValues,
  findVariantForOption,
  getOptionName,
} from "@/entities/product/lib/variantOptions";

/** Nombre de la opción de Shopify que representa el acabado (Rolled | Wrapped | Framed). */
export const TYPE_OPTION_NAME = "type";

/** Nombre real (con su capitalización) de la opción de tipo, si el producto la tiene. */
export function getTypeOptionName(product: ShopifyProduct): string | null {
  return getOptionName(product, TYPE_OPTION_NAME);
}

/**
 * Tipos disponibles para la variante seleccionada. El valor de Shopify se usa
 * también como etiqueta: es el que describe `typeInfo.ts` y el que ve el
 * comprador.
 */
export function buildTypeOptions(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
): ChipOption[] {
  const typeOptionName = getTypeOptionName(product);
  if (!typeOptionName) return [];

  return buildOptionValues(product, selectedVariant, typeOptionName).map(
    ({ value, disabled }) => ({ value, label: value, disabled }),
  );
}

/** Variante que corresponde a un tipo manteniendo el resto de opciones. */
export function findVariantForType(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  type: string,
): ShopifyVariant | null {
  const typeOptionName = getTypeOptionName(product);
  if (!typeOptionName) return null;

  return findVariantForOption(product, selectedVariant, typeOptionName, type);
}
