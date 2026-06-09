"use client";

import Image from "next/image";
import { ShopifyProduct } from "@/lib/shopify";
import { getOtherSetImage } from "@/entities/product/lib/getOtherSetImage";
import { Container } from "@/shared/ui/Container";

interface RoomViewProps {
  product: ShopifyProduct;
  selectedVariantId: string;
}

export default function RoomView({
  product,
  selectedVariantId,
}: RoomViewProps) {
  const selectedVariant = product.variants.edges.find(
    (v) => v.node.id === selectedVariantId,
  )?.node;
  const otherSetImage = getOtherSetImage(product, selectedVariant);

  if (!otherSetImage) return null;

  return (
    <section className="bg-cream">
      <Container className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
        <div className="w-full overflow-hidden md:w-2/5">
          <Image
            src={otherSetImage}
            alt={`${product.title} — en tu espacio`}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-auto w-full"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 15%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%)",
            }}
          />
        </div>
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <h2 className="text-4xl font-black text-[#103642] leading-[1.1] tracking-tight mb-2 lg:mb-8">
            More than a poster. It&apos;s a tribute.
          </h2>
          <p className="font-body text-text-main">
            Our pets are part of our story. We believe they deserve more than
            just a photo on your phone. Each artwork is a daily reminder of the
            love, joy, and loyalty they bring into our lives.
          </p>
          <div className="my-4 grid grid-cols-3 gap-4">
            {[
              { icon: "favorite", label: "Celebrate the bond" },
              { icon: "local_florist", label: "Honor their memory" },
              { icon: "photo_camera", label: "Create lasting moments" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[24px]">
                    {icon}
                  </span>
                </span>
                <span className="text-sm font-medium text-[#103642]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
