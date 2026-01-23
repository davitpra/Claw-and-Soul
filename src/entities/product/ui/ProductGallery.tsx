"use client";

import { ShopifyProduct } from "@/lib/shopify";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  product: ShopifyProduct;
  mainImage: string;
  onImageSelect: (url: string) => void;
}

export default function ProductGallery({
  product,
  mainImage,
  onImageSelect,
}: ProductGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        // Calculate the width of one item including its gap
        const style = window.getComputedStyle(container);
        const gap = parseInt(style.columnGap) || 0;
        const scrollAmount = firstChild.offsetWidth + gap;

        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="lg:col-span-6 flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-lg relative group">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${mainImage}')` }}
        ></div>
      </div>

      {/* Thumbnails Carousel */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity ml-2 border border-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {product.images.edges.map((thumb, idx) => (
            <button
              key={idx}
              onClick={() => onImageSelect(thumb.node.url)}
              className={`flex-shrink-0 w-[calc((100%-24px)/3)] md:w-[calc((100%-32px)/3)] aspect-square rounded-xl overflow-hidden border-2 transition-all snap-start ${
                mainImage === thumb.node.url
                  ? "border-primary shadow-sm"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <div
                className="w-full h-full bg-center bg-no-repeat bg-cover hover:opacity-90 transition-opacity"
                style={{ backgroundImage: `url('${thumb.node.url}')` }}
              ></div>
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity mr-2 border border-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
