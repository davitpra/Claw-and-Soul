"use client";

import { usePbnProduct } from "@/features/pbn-purchase";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";

/**
 * Related products of the Paint-by-Numbers kit on the studio landing. The kit
 * is the product configured in the admin (GET /products/pbn), so the section
 * shows whatever is curated for it in Shopify (Search & Discovery) and renders
 * nothing while it loads or when no related product is set.
 */
export default function LandingRelatedProducts() {
  const { product } = usePbnProduct();
  const accessories = getRelatedAccessories(product);

  if (accessories.length === 0) return null;

  return (
    <RelatedProducts
      accessories={accessories}
      heading={"Everything you need\nto paint it."}
      ctaHref="/catalog"
      ctaLabel="Shop the studio"
    />
  );
}
