"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import { StyleCollection } from "@/widgets/collection";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { RoomView } from "@/widgets/room-view";
import { Reviews } from "@/widgets/reviews";
import { RelatedProductsDeck } from "@/widgets/related-gallery";
import { getRelatedProducts } from "@/entities/product/lib/getRelatedProducts";

export default function CanvasTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
}: ProductTemplateProps) {
  const relatedProducts = getRelatedProducts(product);

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
      {relatedProducts.length > 0 && (
        <RelatedProductsDeck
          products={relatedProducts}
          heading="You may also like"
        />
      )}
      <Reviews />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
