"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import { StyleCollection } from "@/widgets/collection";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { RoomView } from "@/widgets/room-view";
import { Reviews } from "@/widgets/reviews";
import { CollectionShowcase } from "@/widgets/collection-showcase";
import { useProductShowcase } from "@/hooks/useProductShowcase";

export default function CanvasTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
}: ProductTemplateProps) {
  const { collectionHandle } = useProductShowcase(handle);

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

      <RoomView product={product} selectedVariantId={selectedVariantId} />
      {collectionHandle && <CollectionShowcase handle={collectionHandle} />}
      <Reviews />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
