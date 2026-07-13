"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { AccessoryCard } from "./usePbnAccessories";

interface AccessoryUpsellProps {
  accessory: AccessoryCard;
  /** Bundle discount configured in Shopify, as a percentage. Hidden when null. */
  bundlePercent?: number | null;
}

function formatPrice(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency || "USD",
  }).format(n);
}

/**
 * Cross-sell card for a single PBN accessory (paints, brushes…), shown as a
 * slide next to the purchase card: image on the left, copy in the middle, price
 * and add-to-cart on the right. Items go into the cart as plain line items with
 * NO generation/paint-by-numbers attributes — zero coupling with the AI flow.
 * The bundle discount is a native Shopify automatic discount; we only surface it.
 */
export function AccessoryUpsell({
  accessory,
  bundlePercent,
}: AccessoryUpsellProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const add = () => {
    if (!accessory.available) return;
    addToCart({
      id: `accessory-${accessory.variantId}`,
      variantId: accessory.variantId,
      name: accessory.title,
      price: Number.parseFloat(accessory.price.amount) || 0,
      quantity: 1,
      img: accessory.image,
    });
    setAdded(true);
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 rounded-2xl bg-white p-5 sm:p-6 lg:flex-row lg:items-stretch lg:gap-6">
      {/* Image */}
      <Link
        href={`/product/${accessory.handle}`}
        className="relative block shrink-0 overflow-hidden rounded-xl bg-white lg:w-56"
      >
        <div
          className="aspect-4/3 w-full bg-contain bg-center bg-no-repeat lg:h-full"
          style={
            accessory.image
              ? { backgroundImage: `url(${accessory.image})` }
              : undefined
          }
        />
        {bundlePercent != null && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-lg">
            {bundlePercent}% off
          </span>
        )}
      </Link>

      {/* Copy */}
      <div className="min-w-0 flex-1 lg:border-l lg:border-[#E0DED9] lg:pl-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Related
        </p>
        <h3 className="font-display text-xl font-black leading-tight text-slate-dark sm:text-2xl">
          {accessory.title}
        </h3>
        {accessory.subtitle && (
          <p className="mt-0.5 text-[13px] text-text-muted">
            {accessory.subtitle}
          </p>
        )}
        {accessory.description && (
          <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-text-muted">
            {accessory.description}
          </p>
        )}
      </div>

      {/* Price + CTA */}
      <div className="flex shrink-0 flex-col items-stretch justify-center gap-3 lg:w-48">
        <p className="font-display text-2xl font-black leading-none text-primary lg:text-right">
          {formatPrice(accessory.price.amount, accessory.price.currencyCode)}
        </p>
        {added ? (
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-[14px] font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">
              shopping_cart
            </span>
            View cart
          </Link>
        ) : (
          <button
            type="button"
            onClick={add}
            disabled={!accessory.available}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <span className="material-symbols-outlined text-[18px]">
              shopping_bag
            </span>
            {accessory.available ? "Add to cart" : "Sold out"}
          </button>
        )}
      </div>
    </div>
  );
}
