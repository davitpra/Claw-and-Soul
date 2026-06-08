"use client";

import { ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";

interface ProductGalleryProps {
  product: ShopifyProduct;
  mainImage: string;
  otherSetImage?: string | null;
  variantImage?: string | null;
}

export default function ProductGallery({
  product,
  mainImage,
  otherSetImage,
}: ProductGalleryProps) {
  return (
    <div className="lg:col-span-7 flex flex-col gap-8">
      <div className="w-full overflow-hidden bg-white group">
        <Image
          src={mainImage}
          alt={product.title}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
          className={`w-full h-auto`}
          priority
        />
      </div>
      {otherSetImage && (
        <div className="w-full overflow-hidden bg-white rounded-xl group">
          <Image
            src={otherSetImage}
            alt={`${product.title} - set`}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            className={`w-full h-auto max-h-[75vh] object-contain transition-transform duration-700 group-hover:scale-105`}
          />
        </div>
      )}
    </div>
  );
}
