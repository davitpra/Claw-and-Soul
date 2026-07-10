"use client";

import Image from "next/image";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { CreditPackCard } from "@/features/credit-pack-purchase/CreditPackCard";

/**
 * Storefront template for the credit pack product. Unlike Canvas/Poster it does
 * NOT route into the AI personalize flow — it shows the pack image/description
 * and the CreditPackCard (variant picker → add to cart).
 */
export default function CreditsTemplate({ product }: ProductTemplateProps) {
  const image = product.images.edges[0]?.node.url ?? null;

  return (
    <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-300 w-full items-start">
        <div className="overflow-hidden rounded-xl bg-white">
          {image && (
            <Image
              src={image}
              alt={product.title}
              width={800}
              height={800}
              className="w-full h-auto object-cover"
            />
          )}
        </div>

        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-text-main">
            {product.title}
          </h1>
          {product.description && (
            <p className="mt-3 text-text-muted">{product.description}</p>
          )}
          <div className="mt-6">
            <CreditPackCard />
          </div>
        </div>
      </div>
    </div>
  );
}
