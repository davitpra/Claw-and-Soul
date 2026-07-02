import { ShopifyProduct } from "@/lib/shopify";
import { Product } from "@/entities/pet-product/model/types";

/**
 * Productos relacionados curados en Shopify vía la app Search & Discovery
 * (metafield shopify--discovery--product_recommendation.related_products,
 * tipo list.product_reference). Se mapean al modelo `Product` que consume
 * `ProductCard`. La lista de Shopify puede incluir al propio producto, así que
 * se excluye para no mostrarlo dentro de su propio showcase.
 */
export function getRelatedProducts(product: ShopifyProduct | null): Product[] {
  const edges = product?.relatedProducts?.references?.edges ?? [];

  return edges
    .filter(({ node }) => node.id !== product?.id)
    .map(({ node }) => {
    const price = node.priceRange?.minVariantPrice;

    return {
      name: node.title,
      desc: "",
      price: price
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currencyCode,
          }).format(parseFloat(price.amount))
        : "",
      img:
        node.images.edges[0]?.node.url ??
        "https://placehold.co/400x300?text=Product",
      shopifyHandle: node.handle,
      productRefId: node.id,
    } satisfies Product;
  });
}
