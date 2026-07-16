import { ShopifyProduct, ShopifyProductReferences } from "@/lib/shopify";
import { Product } from "@/entities/pet-product/model/types";

/**
 * Mapea un metafield list.product_reference (ya resuelto con `references`)
 * al modelo `Product` que consume la UI. Excluye al propio producto por si
 * la lista curada en Shopify lo incluye.
 */
export function mapProductReferences(
  product: ShopifyProduct | null,
  metafield: ShopifyProductReferences | null | undefined,
): Product[] {
  const edges = metafield?.references?.edges ?? [];

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
