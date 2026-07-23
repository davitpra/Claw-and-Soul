"use client";

import { StyleCollection } from "@/widgets/collection";
import { SameStyleGallery } from "@/widgets/expanding-gallery";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { PrintedOption } from "@/widgets/printed-option";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import WavesDivider from "@/shared/ui/WavesDivider";

/**
 * Storefront template for digital downloads: the downloadable paint-by-numbers
 * coloring file of the customer's pet (not a physical kit). Same shape as
 * Canvas, plus the painting accessories upsell (paints, brushes…) from
 * getRelatedAccessories and the printed-art alternative for those who'd
 * rather not paint.
 */
export default function DigitalTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
  template,
  artKind,
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
            template={template}
            artKind={artKind}
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
      <PrintedOption handle={handle} />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
