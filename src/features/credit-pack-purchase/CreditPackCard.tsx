"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCreditPackProduct, type CreditPackOption } from "./useCreditPackProduct";

function formatPrice(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(n);
}

/**
 * Storefront widget to buy a generation-credit pack. Lists the configured
 * Shopify variants (each mapped to a credit amount), gated behind login: adding
 * to cart requires an authenticated user so the checkout can attach `_user_id`
 * and the webhook credits the right account.
 */
export function CreditPackCard({ className = "" }: { className?: string }) {
  const { product, options, defaultImage, loading, unavailable } =
    useCreditPackProduct();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const buy = (opt: CreditPackOption) => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/credits");
      return;
    }
    addToCart({
      id: `credits-${opt.variant.id}`,
      variantId: opt.variant.id,
      name: product.title,
      size: `${opt.creditAmount} credits`,
      price: Number.parseFloat(opt.variant.price.amount) || 0,
      quantity: 1,
      img: defaultImage ?? "",
    });
    setAdded(true);
  };

  if (loading) {
    return (
      <div className={`rounded-xl bg-cream px-6 py-8 text-center text-text-muted ${className}`}>
        Loading credit packs…
      </div>
    );
  }

  if (unavailable || options.length === 0) {
    return (
      <div className={`rounded-xl bg-cream px-6 py-8 text-center text-text-muted ${className}`}>
        Credit packs are not available right now. Please check back soon.
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-white p-6 ${className}`}>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <div
            key={opt.variant.id}
            className="flex items-center justify-between rounded-xl border border-[#E0DED9] px-4 py-3"
          >
            <div>
              <p className="font-display font-black text-text-main">
                {opt.creditAmount} credits
              </p>
              <p className="text-sm text-text-muted">
                {formatPrice(
                  opt.variant.price.amount,
                  opt.variant.price.currencyCode,
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => buy(opt)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                shopping_bag
              </span>
              Buy
            </button>
          </div>
        ))}
      </div>

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

      <p className="mt-4 text-center text-xs text-text-muted">
        Credits are added to your account within a minute of payment.
      </p>
    </div>
  );
}
