import { ShopifyProduct } from "@/lib/shopify";

/** URL de la imagen "Thank you image" (metafield de producto) o null. */
export function getThankYouImage(
  product: ShopifyProduct | null | undefined,
): string | null {
  return product?.thankYouImage?.reference?.image?.url ?? null;
}
