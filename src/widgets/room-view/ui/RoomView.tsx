"use client";

import Image from "next/image";
import { ShopifyProduct } from "@/lib/shopify";
import { getOtherSetImage } from "@/entities/product/lib/getOtherSetImage";

interface RoomViewProps {
  product: ShopifyProduct;
  selectedVariantId: string;
}

export default function RoomView({ product, selectedVariantId }: RoomViewProps) {
  const selectedVariant = product.variants.edges.find(
    (v) => v.node.id === selectedVariantId,
  )?.node;
  const otherSetImage = getOtherSetImage(product, selectedVariant);

  if (!otherSetImage) return null;

  return (
    <section className="bg-cream py-12 md:py-16 px-4 md:px-10 lg:px-40">
      <div className="mx-auto flex max-w-300 flex-col items-center gap-8 md:flex-row md:gap-16">
        <div className="w-full overflow-hidden rounded-xl md:w-1/2">
          <Image
            src={otherSetImage}
            alt={`${product.title} — en tu espacio`}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-auto w-full"
          />
        </div>
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <span className="text-primary font-bold uppercase tracking-wider text-xs">
            En tu espacio
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-text-main">
            Mira cómo luce en tu pared
          </h2>
          <p className="font-body text-text-muted leading-relaxed">
            Cada pieza está pensada para integrarse en tu hogar. Visualiza el
            tamaño y el acabado en un entorno real antes de personalizar la tuya.
          </p>
        </div>
      </div>
    </section>
  );
}
