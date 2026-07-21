"use client";

import { StyleCollection } from "@/widgets/collection";
import { SameStyleGallery } from "@/widgets/expanding-gallery";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { RoomView } from "@/widgets/room-view";
import { Reviews } from "@/widgets/reviews";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import ProductDetails from "@/widgets/product-details/ui/ProductDetails";

/**
 * Storefront template for the Paint-by-Numbers kit: same shape as Canvas, plus
 * the PBN accessories upsell (paints, brushes…) from getRelatedAccessories.
 */
export default function PBNTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
}: ProductTemplateProps) {
  const relatedAccessories = getRelatedAccessories(product);

  return (
    <>
      <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
        <div className="layout-content-container flex flex-col max-w-300 w-full gap-8">
          <ProductDetails
            product={product}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            mainImage={mainImage}
            setMainImage={setMainImage}
          />
        </div>
      </div>

      <StyleCollection handle={handle} />
      <SameStyleGallery handle={handle} />
      {relatedAccessories.length > 0 && (
        <RelatedProducts accessories={relatedAccessories} />
      )}

      <RoomView product={product} selectedVariantId={selectedVariantId} />
      <Reviews />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
