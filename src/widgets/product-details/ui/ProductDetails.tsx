"use client";

import { ShopifyProduct } from "@/lib/shopify";
import ProductGallery from "@/entities/product/ui/ProductGallery";
import ProductInfo from "@/entities/product/ui/ProductInfo";
import ProductVariantSelector from "@/entities/product/ui/ProductVariantSelector";
import AddToCartButton from "@/features/add-to-cart/ui/AddToCartButton";
import { useEffect } from "react";
import { productsList } from "@/entities/pet-product/model/products";
import { useFormatOptions } from "@/hooks/useFormatOptions";

interface ProductDetailsProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
}

export default function ProductDetails({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
}: ProductDetailsProps) {
  const selectedVariant = product.variants.edges.find(
    (v) => v.node.id === selectedVariantId,
  )?.node;

  // Sync main image with selected variant
  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setMainImage(selectedVariant.image.url);
    }
  }, [selectedVariant, setMainImage]);

  // Map Shopify variant → backend formatId via compat API
  const backendProduct = productsList.find(
    (p) => p.shopifyHandle === product.handle,
  );
  const { formats } = useFormatOptions(
    backendProduct?.shopifyHandle ?? null,
    backendProduct?.productRefId ?? null,
  );
  const selectedFormatOption = formats.find(
    (f) => f.shopifyVariantId === selectedVariantId,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
      {/* Gallery Section */}
      <ProductGallery
        product={product}
        mainImage={mainImage}
        onImageSelect={setMainImage}
        variantImage={selectedVariant?.image?.url}
      />

      {/* Product Info Section */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="sticky top-24 flex flex-col gap-6">
          <ProductInfo product={product} selectedVariant={selectedVariant} />

          <div className="h-px w-full bg-text-main/10"></div>

          <ProductVariantSelector
            product={product}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />

          <AddToCartButton
            product={product}
            selectedVariant={selectedVariant}
            mainImage={mainImage}
            productRefId={backendProduct?.productRefId}
            formatId={selectedFormatOption?.formatId}
          />
        </div>
      </div>
    </div>
  );
}
