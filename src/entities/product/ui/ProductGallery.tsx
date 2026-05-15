"use client";

import { ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import { Carousel } from "@/shared/ui/Carousel";

interface ProductGalleryProps {
  product: ShopifyProduct;
  mainImage: string;
  onImageSelect: (url: string) => void;
  variantImage?: string | null;
}

export default function ProductGallery({
  product,
  mainImage,
  onImageSelect,
  variantImage,
}: ProductGalleryProps) {
  const allImages = [
    ...(variantImage
      ? [{ node: { url: variantImage, altText: "Selected variant" } }]
      : []),
    ...product.images.edges,
  ].filter(
    (img, idx, arr) =>
      arr.findIndex((i) => i.node.url === img.node.url) === idx,
  );

  return (
    <div className="lg:col-span-6 flex flex-col gap-4">
      <div className="w-full aspect-3/4 max-h-[75vh] rounded-xl overflow-hidden bg-white relative group">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      </div>

      <Carousel gap="gap-3">
        {allImages.map((thumb, idx) => (
          <button
            key={idx}
            onClick={() => onImageSelect(thumb.node.url)}
            className={`shrink-0 w-[calc((100%-24px)/3)] aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              mainImage === thumb.node.url
                ? "border-primary shadow-sm"
                : "border-transparent hover:border-primary/50"
            }`}
            aria-label={`View image ${idx + 1} of ${allImages.length}`}
          >
            <div className="relative w-full h-full">
              <Image
                src={thumb.node.url}
                alt={thumb.node.altText || `${product.title} image ${idx + 1}`}
                fill
                sizes="150px"
                className="object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          </button>
        ))}
      </Carousel>
    </div>
  );
}
