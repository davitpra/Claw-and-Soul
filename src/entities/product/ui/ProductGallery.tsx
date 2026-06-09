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
}: ProductGalleryProps) {
  return (
    <div className="lg:col-span-7 flex flex-col gap-8">
      <div className="w-full p-6 md:p-10 group">
        <Image
          src={mainImage}
          alt={product.title}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
          className="w-full h-auto bg-white shadow-[0_30px_55px_-15px_rgba(0,0,0,0.55)] transition-shadow duration-300 group-hover:shadow-[0_40px_65px_-25px_rgba(0,0,0,0.65)]"
          priority
        />
      </div>
    </div>
  );
}
