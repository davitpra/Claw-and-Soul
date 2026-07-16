import { ShopifyProduct } from "@/lib/shopify";
import { Product } from "@/entities/pet-product/model/types";
import { mapProductReferences } from "./mapProductReferences";

/**
 * Productos similares curados a mano en Shopify vía el metafield
 * custom.similar_products (tipo list.product_reference). A diferencia de
 * `getRelatedProducts` (Search & Discovery), esta lista la controla
 * directamente el admin del producto.
 */
export function getSimilarProducts(product: ShopifyProduct | null): Product[] {
  return mapProductReferences(product, product?.similarProducts);
}
