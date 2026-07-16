import { ShopifyProduct } from "@/lib/shopify";
import { Product } from "@/entities/pet-product/model/types";
import { mapProductReferences } from "./mapProductReferences";

/**
 * Productos relacionados curados en Shopify vía la app Search & Discovery
 * (metafield shopify--discovery--product_recommendation.related_products,
 * tipo list.product_reference).
 */
export function getRelatedProducts(product: ShopifyProduct | null): Product[] {
  return mapProductReferences(product, product?.relatedProducts);
}
