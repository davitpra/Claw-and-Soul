import type { ShopifyProduct } from "@/lib/shopify";
import { getSizeOptionName } from "./sizeOptions";

/**
 * Dimensiones físicas del formato, normalizadas a **centímetros**.
 *
 * OJO: el backend guarda `width`/`height` como resolución de generación en
 * píxeles (siempre 1024 de ancho), inútil para escalar una vista previa. El
 * tamaño real vive en el valor de la talla de Shopify (`"20×30 cm"`, `8x12"`),
 * así que lo leemos de ahí y lo pasamos a una unidad común (cm) para poder
 * comparar formatos entre productos aunque unos vengan en cm y otros en
 * pulgadas.
 *
 * Devuelve `null` si el producto no tiene opción de talla o si el valor no
 * sigue el patrón `AxB` (el consumidor cae entonces a su tamaño por defecto).
 */
export function getFormatPhysicalSize(
  product: ShopifyProduct | null | undefined,
  shopifyVariantId: string,
): { width: number; height: number } | null {
  if (!product) return null;

  const sizeOptionName = getSizeOptionName(product);
  if (!sizeOptionName) return null;

  const variant = product.variants.edges.find(
    (e) => e.node.id === shopifyVariantId,
  )?.node;
  const value = variant?.selectedOptions.find(
    (o) => o.name === sizeOptionName,
  )?.value;
  if (!value) return null;

  const match = value.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;

  let width = Number(match[1]);
  let height = Number(match[2]);

  // Normaliza a cm: "mm" se divide, "cm" queda igual y cualquier otra cosa
  // (incluido sin unidad, p. ej. `8x10`, o con comillas) se asume en pulgadas.
  if (/mm/i.test(value)) {
    width /= 10;
    height /= 10;
  } else if (!/cm/i.test(value)) {
    width *= 2.54;
    height *= 2.54;
  }

  return { width, height };
}
