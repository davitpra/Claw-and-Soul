"use client";

import { StyleCollection } from "@/widgets/collection";
import { SameStyleGallery } from "@/widgets/expanding-gallery";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { RoomView } from "@/widgets/room-view";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import WavesDivider from "@/shared/ui/WavesDivider";

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
        <>
          <WavesDivider
            waveColor="var(--color-cream)"
            fillColor="var(--color-cream)"
          />
          <RelatedProducts accessories={relatedAccessories} />
          <WavesDivider
            waveColor="var(--color-cream)"
            fillColor="var(--color-cream)"
            flip
          />
        </>
      )}

      <RoomView product={product} selectedVariantId={selectedVariantId} />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
