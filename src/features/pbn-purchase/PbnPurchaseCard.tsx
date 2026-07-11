"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { RGB } from "@/lib/pbn/common";
import type { ShopifyVariant } from "@/lib/shopify/types";
import { usePbnProduct } from "./usePbnProduct";

interface PbnPurchaseCardProps {
  /** Colors of the generated result, drawn on the palette strip + thumb. */
  palette: RGB[];
  /** Colored preview (compareImgs.processed data URL) for the thumbnail. */
  previewUrl?: string | null;
  /**
   * Resolves a saved PBN: returns the existing one, or saves on demand
   * (redirecting to login if there's no session). Returns null if it couldn't
   * be saved so the caller aborts the add-to-cart.
   */
  ensureSaved: () => Promise<{ id: string; previewUrl?: string | null } | null>;
}

/** Static "what's in the box" copy — the kit contents don't vary per variant. */
const INCLUDED = [
  "Pre-printed numbered canvas",
  "Matched acrylic paint set",
  "Two brushes (fine + broad)",
  "Color mixing guide",
];

function variantLabel(v: ShopifyVariant): string {
  const size = v.selectedOptions.find((o) => /size|tama/i.test(o.name));
  return size?.value ?? v.title;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

const swatch = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

/**
 * Purchase card shown right after a Paint-by-Numbers result is generated. Reads
 * the real Shopify variants (sizes/prices) via {@link usePbnProduct}, and adds
 * the kit to the cart carrying `paintByNumbersId`. Saving is transparent: the
 * PBN is persisted on demand through `ensureSaved` when the user adds to cart.
 */
export function PbnPurchaseCard({
  palette,
  previewUrl,
  ensureSaved,
}: PbnPurchaseCardProps) {
  const { product, variants, defaultImage, loading, unavailable } =
    usePbnProduct();
  const { addToCart } = useCart();

  // Default to the middle option when there are three sizes, else the first.
  const defaultVariantId = useMemo(() => {
    if (variants.length === 0) return null;
    const mid = variants[Math.floor(variants.length / 2)];
    return (variants.length === 3 ? mid : variants[0]).id;
  }, [variants]);

  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedId = variantId ?? defaultVariantId;
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (loading) {
    return (
      <div className="mx-auto mt-4 w-full max-w-105 animate-pulse rounded-2xl border border-cream bg-white p-6">
        <div className="h-40 rounded-xl bg-cream" />
      </div>
    );
  }

  if (unavailable || variants.length === 0 || !selected) return null;

  // Shopify product image for the thumbnail; the generated preview is only a fallback.
  const thumbUrl = selected.image?.url ?? defaultImage ?? previewUrl;

  const unitPrice = Number.parseFloat(selected.price.amount) || 0;
  const currency = selected.price.currencyCode || "CAD";
  const total = unitPrice * qty;

  const handleAdd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const pbn = await ensureSaved();
      if (!pbn || !product) return;
      addToCart({
        id: `pbn-${pbn.id}-${selected.id}`,
        variantId: selected.id,
        name: product.title,
        size: variantLabel(selected),
        price: unitPrice,
        quantity: qty,
        img: selected.image?.url ?? defaultImage ?? "",
        paintByNumbersId: pbn.id,
      });
      setAdded(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-105 rounded-2xl border border-cream bg-white p-5 shadow-[0_1px_2px_rgba(18,50,60,.04),0_12px_28px_-18px_rgba(18,50,60,.22)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="grid size-14 shrink-0 grid-cols-3 grid-rows-3 overflow-hidden rounded-xl border border-cream bg-cream bg-cover bg-center"
          style={
            thumbUrl ? { backgroundImage: `url(${thumbUrl})` } : undefined
          }
        >
          {!thumbUrl &&
            palette
              .slice(0, 9)
              .map((c, i) => (
                <div key={i} style={{ backgroundColor: swatch(c) }} />
              ))}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Paint-by-Numbers kit
          </p>
          <h3 className="font-display text-lg font-black leading-tight text-slate-dark">
            Your custom canvas
          </h3>
          <p className="mt-0.5 text-[13px] text-text-muted">
            {palette.length}-color kit · printed from your artwork
          </p>
        </div>
      </div>

      {/* Palette strip */}
      {palette.length > 0 && (
        <div
          aria-hidden
          className="mb-5 flex h-2.5 overflow-hidden rounded-lg border border-cream"
        >
          {palette.map((c, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: swatch(c) }} />
          ))}
        </div>
      )}

      {/* Size selector */}
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
        Choose a size
      </p>
      <div role="radiogroup" aria-label="Canvas size" className="mb-5 grid gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selected.id;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setVariantId(v.id)}
              className={`flex w-full items-center justify-between rounded-xl border-[1.5px] px-3.5 py-2.5 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-cream bg-white hover:border-primary/40"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid size-4.5 shrink-0 place-items-center rounded-full border-[1.5px] ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-black/20"
                  }`}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 13l4.5 4.5L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-dark">
                  {variantLabel(v)}
                </span>
              </span>
              <span className="text-sm font-bold text-slate-dark">
                {formatPrice(Number.parseFloat(v.price.amount) || 0, v.price.currencyCode)}
              </span>
            </button>
          );
        })}
      </div>

      {/* What's included */}
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
        In the box
      </p>
      <ul className="mb-5 grid gap-1.5">
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[13px] text-slate-dark">
            <span className="material-symbols-outlined text-[16px] text-primary">
              check
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mb-4 h-px bg-cream" />

      {/* Quantity + total */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-muted">Quantity</span>
          <div className="flex items-center overflow-hidden rounded-lg border border-cream">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="grid size-9 place-items-center text-primary transition-colors hover:bg-cream disabled:text-black/20 disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-9 text-center text-sm font-bold text-slate-dark">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              disabled={qty >= 10}
              className="grid size-9 place-items-center text-primary transition-colors hover:bg-cream disabled:text-black/20 disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted">Total</p>
          <p className="font-display text-2xl font-black leading-none text-slate-dark">
            {formatPrice(total, currency)}
          </p>
        </div>
      </div>

      {/* CTA */}
      {added ? (
        <Link
          href="/cart"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3.5 text-[15px] font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          View cart
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-70"
        >
          <span
            className={`material-symbols-outlined text-[20px] ${busy ? "animate-spin" : ""}`}
          >
            {busy ? "progress_activity" : "shopping_bag"}
          </span>
          {busy ? "Adding…" : `Add to cart · ${formatPrice(total, currency)}`}
        </button>
      )}

      {/* Reassurance */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
        <span className="material-symbols-outlined text-[16px] text-primary">
          local_shipping
        </span>
        Free shipping · ships in 5–7 days
      </div>
      <div className="mt-2 flex items-start justify-center gap-1 text-[11px] text-black/40">
        <span className="material-symbols-outlined text-[13px]">info</span>
        Printed from the design you generated above.
      </div>
    </div>
  );
}
