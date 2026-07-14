"use client";

import { ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import { Carousel } from "@/shared/ui/Carousel";
import { ImageZoom } from "@/shared/ui/ImageZoom";

interface ProductGalleryProps {
  product: ShopifyProduct;
  mainImage: string;
  otherSetImage?: string | null;
  variantImage?: string | null;
  firstImageScale?: number;
}

export default function ProductGallery({
  product,
  mainImage,
  otherSetImage,
  variantImage,
  firstImageScale = 1,
}: ProductGalleryProps) {
  const primaryImage = variantImage || mainImage;
  const images = [primaryImage, otherSetImage].filter((src): src is string =>
    Boolean(src),
  );
  const uniqueImages = Array.from(new Set(images));

  const imageClassName =
    "w-full h-auto bg-white shadow-[0_14px_32px_-12px_rgba(16,54,66,0.40)] transition-all duration-300 ease-out";
  const hoverClassName =
    "hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";
  const sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px";

  const firstImageStyle = { width: `${firstImageScale * 100}%` };

  const isCarousel = uniqueImages.length > 1;

  return (
    <div className="lg:col-span-7 flex flex-col gap-8">
      <div className={`w-full group ${isCarousel ? "" : "p-6 md:p-10"}`}>
        {isCarousel ? (
          <Carousel showArrows={false} showDots autoplayMs={5000} loop>
            {uniqueImages.map((src, i) => (
              <div
                key={src}
                className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-6 md:px-10 pt-6 pb-12"
              >
                <ImageZoom
                  zoomSrc={src}
                  alt={product.title}
                  style={i === 0 ? firstImageStyle : undefined}
                >
                  <Image
                    src={src}
                    alt={product.title}
                    width={0}
                    height={0}
                    sizes={sizes}
                    className={`${imageClassName} ${i === 0 ? hoverClassName : ""}`}
                    priority={i === 0}
                  />
                </ImageZoom>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-6 md:px-10 pt-6 pb-12">
            <ImageZoom
              zoomSrc={primaryImage}
              alt={product.title}
              style={firstImageStyle}
            >
              <Image
                src={primaryImage}
                alt={product.title}
                width={0}
                height={0}
                sizes={sizes}
                className={`${imageClassName} ${hoverClassName}`}
                priority
              />
            </ImageZoom>
          </div>
        )}
      </div>
    </div>
  );
}
