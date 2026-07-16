import { ShopifyProduct } from "@/lib/shopify";
import { toAccessoryCard, type AccessoryCard } from "@/features/pbn-purchase";

/**
 * Productos relacionados curados en Shopify vía la app Search & Discovery
 * (metafield shopify--discovery--product_recommendation.related_products),
 * mapeados a `AccessoryCard` para mostrarlos como cards de compra directa
 * (AccessoryUpsell). Excluye al propio producto por si la lista curada lo
 * incluye y descarta referencias sin variante comprable.
 */
export function getRelatedAccessories(
  product: ShopifyProduct | null,
): AccessoryCard[] {
  const edges = product?.relatedProducts?.references?.edges ?? [];

  return edges
    .filter(({ node }) => node.id !== product?.id)
    .map(({ node }) => toAccessoryCard(node))
    .filter((card): card is AccessoryCard => card !== null);
}
