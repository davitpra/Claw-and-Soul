import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import {
  buildOptionValues,
  findVariantForOption,
  getOptionName,
} from "@/entities/product/lib/variantOptions";

/** Nombre de la opción de Shopify que representa el tamaño del cuadro. */
export const SIZE_OPTION_NAME = "size";

export interface SizeOption {
  /** Valor de la opción en Shopify (ej. `20×30 cm`). Es la clave de selección. */
  value: string;
  label: string;
  /** Dimensiones físicas parseadas del valor; ausentes si no siguen `AxB`. */
  width?: number;
  height?: number;
  disabled?: boolean;
}

/**
 * Dimensiones físicas del formato, leídas del propio valor de la talla
 * (`8x10`, `20×30 cm`…). El backend no las conoce: sus `width`/`height` son la
 * resolución de generación en píxeles (siempre 1024 de ancho), inútil para una
 * vista previa proporcional.
 */
function parseDimensions(
  value: string,
): { width: number; height: number } | null {
  const match = value.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/** Nombre real (con su capitalización) de la opción de tamaño, si el producto la tiene. */
export function getSizeOptionName(product: ShopifyProduct): string | null {
  return getOptionName(product, SIZE_OPTION_NAME);
}

/**
 * Tallas disponibles para la variante seleccionada. La lista sale de Shopify —
 * siempre existe — y las proporciones se parsean del valor de la talla; si el
 * valor no trae dimensiones, la vista previa cae a un cuadrado.
 */
export function buildSizeOptions(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
): SizeOption[] {
  const sizeOptionName = getSizeOptionName(product);
  if (!sizeOptionName) return [];

  return buildOptionValues(product, selectedVariant, sizeOptionName).map(
    ({ value, disabled }) => {
      const dims = parseDimensions(value);
      return {
        value,
        label: value,
        width: dims?.width,
        height: dims?.height,
        disabled,
      };
    },
  );
}

/** Variante que corresponde a una talla manteniendo el resto de opciones. */
export function findVariantForSize(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  size: string,
): ShopifyVariant | null {
  const sizeOptionName = getSizeOptionName(product);
  if (!sizeOptionName) return null;

  return findVariantForOption(product, selectedVariant, sizeOptionName, size);
}
