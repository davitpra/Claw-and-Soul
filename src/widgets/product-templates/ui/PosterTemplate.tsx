"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { StyleCollection } from "@/widgets/collection";
import { PrintedOption } from "@/widgets/printed-option";
import { SameStyleGallery } from "@/widgets/expanding-gallery";

export default function PosterTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  faqs,
  handle,
  frameStyle,
  template,
  artKind,
}: ProductTemplateProps) {
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
            frameStyle={frameStyle}
            template={template}
            artKind={artKind}
          />
        </div>
      </div>
      <StyleCollection handle={handle} frameStyle={frameStyle} />
      <SameStyleGallery handle={handle} />
      {/* La alternativa impresa solo tiene sentido en el poster coloreable. */}
      {artKind === "pbn" && <PrintedOption handle={handle} />}
      <ProductFAQ faqs={faqs} />
    </>
  );
}
