"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { StyleCollection } from "@/widgets/collection";
import { RoomView } from "@/widgets/room-view";
import { Reviews } from "@/widgets/reviews";

export default function PosterTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  faqs,
  handle,
  frameStyle,
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
          />
        </div>
      </div>
      <StyleCollection handle={handle} />
      <RoomView product={product} selectedVariantId={selectedVariantId} />
      <Reviews />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
