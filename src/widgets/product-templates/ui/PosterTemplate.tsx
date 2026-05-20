"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";

export default function PosterTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  faqs,
}: ProductTemplateProps) {
  return (
    <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
      <div className="layout-content-container flex flex-col max-w-300 w-full gap-8">
        <ProductDetails
          product={product}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
          mainImage={mainImage}
          setMainImage={setMainImage}
        />
        <ProductFAQ faqs={faqs} />
      </div>
    </div>
  );
}
