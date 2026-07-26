import type { ShopifyVariant } from "@/lib/shopify/types";

/**
 * Etiqueta corta de una variante de cara al cliente: el valor de su opción de
 * talla cuando la tiene ("20×30 cm"), y el título completo de la variante si no.
 */
export function variantLabel(variant: ShopifyVariant): string {
  const size = variant.selectedOptions.find((o) => /size|tama/i.test(o.name));
  return size?.value ?? variant.title;
}

/**
 * Precio formateado para las cards de compra del storefront. El locale es el
 * de la tienda (Canadá), no el del navegador: el importe lo cobra Shopify en
 * CAD y verlo en otro formato al pasar por checkout genera desconfianza.
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}
