import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

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
  const names = product.variants.edges[0]?.node.selectedOptions ?? [];
  return (
    names.find((o) => o.name.toLowerCase() === SIZE_OPTION_NAME)?.name ?? null
  );
}

function optionsOf(variant: ShopifyVariant | undefined) {
  const result: Record<string, string> = {};
  variant?.selectedOptions.forEach((o) => {
    result[o.name] = o.value;
  });
  return result;
}

/**
 * Un producto puede combinar tamaño con otras opciones (color, marco…). Sólo
 * son tallas elegibles las variantes que coinciden con la seleccionada en todo
 * *menos* el tamaño; si no, cambiar de talla saltaría también de color.
 */
function matchesSiblings(
  variant: ShopifyVariant,
  current: Record<string, string>,
  sizeOptionName: string,
) {
  return variant.selectedOptions.every(
    (o) =>
      o.name === sizeOptionName ||
      current[o.name] === undefined ||
      current[o.name] === o.value,
  );
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

  const current = optionsOf(selectedVariant);
  const seen = new Set<string>();
  const options: SizeOption[] = [];

  for (const { node } of product.variants.edges) {
    const value = node.selectedOptions.find(
      (o) => o.name === sizeOptionName,
    )?.value;
    if (!value || seen.has(value)) continue;
    if (!matchesSiblings(node, current, sizeOptionName)) continue;

    seen.add(value);
    const dims = parseDimensions(value);
    options.push({
      value,
      label: value,
      width: dims?.width,
      height: dims?.height,
      disabled: !node.availableForSale,
    });
  }

  return options;
}

/** Variante que corresponde a una talla manteniendo el resto de opciones. */
export function findVariantForSize(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  size: string,
): ShopifyVariant | null {
  const sizeOptionName = getSizeOptionName(product);
  if (!sizeOptionName) return null;

  const current = optionsOf(selectedVariant);

  return (
    product.variants.edges.find(
      ({ node }) =>
        node.selectedOptions.some(
          (o) => o.name === sizeOptionName && o.value === size,
        ) && matchesSiblings(node, current, sizeOptionName),
    )?.node ?? null
  );
}
