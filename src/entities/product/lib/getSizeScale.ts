import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

const DIM_RE = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i;

/**
 * Lado físico más largo (pulgadas) de la variante, parseado del token "NxM"
 * de su opción de tamaño (ej. "8x10", "24x36"). null si no aplica.
 */
function longestSide(variant: ShopifyVariant | undefined): number | null {
  if (!variant) return null;
  for (const o of variant.selectedOptions) {
    const m = o.value.match(DIM_RE);
    if (m) return Math.max(parseFloat(m[1]), parseFloat(m[2]));
  }
  return null;
}

/**
 * Factor de ancho (0–1) para la imagen principal, proporcional al tamaño físico
 * de la variante seleccionada relativo a la variante más grande del producto.
 * La más grande = 1 (100%); las menores escalan con piso `minScale`.
 * Sin token de tamaño devuelve 1 (sin escalar).
 */
export function getSizeScale(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
  minScale = 0.7,
): number {
  const sel = longestSide(selectedVariant);
  if (sel == null) return 1;
  const all = product.variants.edges
    .map((e) => longestSide(e.node))
    .filter((n): n is number => n != null);
  const hi = Math.max(...all);
  if (!hi) return 1;
  return Math.min(1, Math.max(minScale, sel / hi));
}
