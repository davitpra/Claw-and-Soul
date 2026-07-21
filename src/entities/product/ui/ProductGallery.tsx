"use client";

import { ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import { Carousel } from "@/shared/ui/Carousel";
import { ImageZoom } from "@/shared/ui/ImageZoom";
import { FRAME_SHADOWS } from "@/entities/product/lib/frameStyle";
import type { FrameStyle } from "@/entities/product/lib/frameStyle";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";

interface ProductGalleryProps {
  product: ShopifyProduct;
  mainImage: string;
  otherSetImage?: string | null;
  variantImage?: string | null;
  frameStyle?: FrameStyle;
}

export default function ProductGallery({
  product,
  mainImage,
  otherSetImage,
  variantImage,
  frameStyle = "art",
}: ProductGalleryProps) {
  const primaryImage = variantImage || mainImage;
  const images = [primaryImage, otherSetImage].filter((src): src is string =>
    Boolean(src),
  );
  const uniqueImages = Array.from(new Set(images));

  const baseImageClassName =
    "w-full h-auto bg-white transition-all duration-300 ease-out";
  // The frame effect (canvas/poster/art) only applies to the primary product
  // image; secondary images (e.g. lifestyle) stay neutral with the art float.
  const primaryImageClassName = `${baseImageClassName} ${FRAME_SHADOWS[frameStyle]}`;
  const secondaryImageClassName = `${baseImageClassName} ${FRAME_SHADOWS.art}`;
  // Only "art" deepens its shadow on hover; canvas/poster keep their base shadow
  // so the edge effect survives the hover state. The lift is on the wrapper so
  // the canvas darkening overlay travels together with the image.
  const hoverShadowClass =
    frameStyle === "art"
      ? "hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]"
      : "";
  const sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px";

  const isCarousel = uniqueImages.length > 1;

  // The primary image: width-scaled wrapper that lifts on hover and carries the
  // optional canvas darkening overlay on top of the image.
  const renderPrimary = (src: string) => (
    <div className="relative transition-transform duration-300 ease-out hover:-translate-y-1.5">
      <ImageZoom zoomSrc={src} alt={product.title} frameStyle={frameStyle}>
        <Image
          src={src}
          alt={product.title}
          width={0}
          height={0}
          sizes={sizes}
          className={`${primaryImageClassName} ${hoverShadowClass}`}
          priority
        />
      </ImageZoom>
      {frameStyle === "canvas" && <CanvasEdgeOverlay />}
    </div>
  );

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
                {i === 0 ? (
                  renderPrimary(src)
                ) : (
                  <ImageZoom zoomSrc={src} alt={product.title}>
                    <Image
                      src={src}
                      alt={product.title}
                      width={0}
                      height={0}
                      sizes={sizes}
                      className={secondaryImageClassName}
                    />
                  </ImageZoom>
                )}
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-6 md:px-10 pt-6 pb-12">
            {renderPrimary(primaryImage)}
          </div>
        )}
      </div>
    </div>
  );
}
