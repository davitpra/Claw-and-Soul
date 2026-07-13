"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ProductTemplateProps } from "./ProductPageTemplate";

function formatPrice(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(n);
}

/**
 * Storefront template for generic PBN accessories (paints, brushes, markers,
 * palettes…). Unlike Canvas/Poster it does NOT route into the AI personalize
 * flow: no size selector, no lifestyle metaobject, no PBN logic. Just a simple
 * gallery + price + quantity + add-to-cart. Items go to the cart as plain line
 * items with no generation/paint-by-numbers attributes.
 */
export default function AccessoryTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
}: ProductTemplateProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variants = product.variants.edges.map((e) => e.node);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  const images = product.images.edges.map((e) => e.node);
  const price =
    selectedVariant?.price ?? product.priceRange?.minVariantPrice ?? null;
  const compareAt =
    selectedVariant?.compareAtPrice ??
    product.compareAtPriceRange?.minVariantPrice ??
    null;

  const available = selectedVariant?.availableForSale ?? true;
  const hasVariantChoice = variants.length > 1;

  const handleAdd = () => {
    if (!selectedVariant || !available) return;
    addToCart({
      id: `accessory-${selectedVariant.id}`,
      variantId: selectedVariant.id,
      name: product.title,
      size: hasVariantChoice ? selectedVariant.title : undefined,
      price: Number.parseFloat(selectedVariant.price.amount) || 0,
      quantity,
      img: selectedVariant.image?.url ?? images[0]?.url ?? "",
    });
    setAdded(true);
  };

  return (
    <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-300 w-full items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl bg-white">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                width={800}
                height={800}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="aspect-square w-full bg-cream" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img) => {
                const isActive = img.url === mainImage;
                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setMainImage(img.url)}
                    aria-label={`Show ${img.altText || product.title}`}
                    className={`shrink-0 overflow-hidden rounded-xl transition-all ${
                      isActive
                        ? "ring-2 ring-primary"
                        : "ring-1 ring-[#E0DED9] hover:ring-primary/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
                      width={80}
                      height={80}
                      className="h-20 w-20 object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-text-main">
            {product.title}
          </h1>

          {price && (
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display font-black text-2xl text-text-main">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {compareAt &&
                Number.parseFloat(compareAt.amount) >
                  Number.parseFloat(price.amount) && (
                  <span className="text-text-muted line-through">
                    {formatPrice(compareAt.amount, compareAt.currencyCode)}
                  </span>
                )}
            </div>
          )}

          {product.description && (
            <p className="mt-4 text-text-muted whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Variant picker (only when the accessory has real options) */}
          {hasVariantChoice && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold text-text-main">Option</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isActive = v.id === selectedVariant?.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.availableForSale}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        if (v.image?.url) setMainImage(v.image.url);
                        setAdded(false);
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        isActive
                          ? "bg-primary text-white"
                          : "border border-[#E0DED9] text-text-main hover:bg-gray-50"
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold text-text-main">Quantity</p>
            <div className="inline-flex items-center rounded-xl border border-[#E0DED9]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-text-main transition-colors hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  remove
                </span>
              </button>
              <span className="w-10 text-center font-bold text-text-main">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center text-text-main transition-colors hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!available}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                shopping_bag
              </span>
              {available ? "Add to cart" : "Sold out"}
            </button>

            {added && (
              <Link
                href="/cart"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">
                  shopping_cart
                </span>
                View cart
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
