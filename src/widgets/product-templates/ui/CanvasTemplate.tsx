"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import { StyleCollection } from "@/widgets/collection";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { RoomView } from "@/widgets/room-view";
import { Reviews } from "@/widgets/reviews";
import { SimilarProductsDeck } from "@/widgets/similar-gallery";
import { RelatedProducts } from "@/widgets/related-products";
import { getSimilarProducts } from "@/entities/product/lib/getSimilarProducts";
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
  const similarProducts = getSimilarProducts(product);
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
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

      {similarProducts.length > 0 && (
        <SimilarProductsDeck
          products={similarProducts}
          heading="Similar Souls"
        />
      )}
      <RoomView product={product} selectedVariantId={selectedVariantId} />

      <Reviews />
      <ProductFAQ faqs={faqs} />
    </>
  );
}
