/**
 * Construcción de enlaces al admin de Shopify (admin.shopify.com unificado).
 *
 * El slug de la tienda se lee de `NEXT_PUBLIC_SHOPIFY_STORE_SLUG`; si no está
 * definido cae a `clawandsoul`. Debe ser `NEXT_PUBLIC_` porque estos enlaces se
 * arman en componentes cliente.
 */
const STORE_SLUG =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_SLUG ?? "clawandsoul";

const ADMIN_BASE = `https://admin.shopify.com/store/${STORE_SLUG}`;

/** URL al detalle de un pedido en el admin de Shopify. */
export function shopifyOrderUrl(shopifyOrderId: string | number): string {
  return `${ADMIN_BASE}/orders/${shopifyOrderId}`;
}

/** URL al detalle de un producto en el admin de Shopify. */
export function shopifyProductUrl(shopifyProductId: string | number): string {
  return `${ADMIN_BASE}/products/${shopifyProductId}`;
}
