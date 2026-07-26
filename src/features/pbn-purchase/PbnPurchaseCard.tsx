"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  variantLabel,
} from "@/entities/product/lib/variantPresentation";
import { PurchaseSizePicker } from "@/entities/product/ui/PurchaseSizePicker";
import type { RGB } from "@/lib/pbn/common";
import { usePbnProduct } from "./usePbnProduct";

/**
 * What the cart line points back to, which differs per entry point:
 *
 * - `saved-pbn` — the studio rendered the template client-side, so it persists
 *   it on demand and the line carries `paintByNumbersId`.
 * - `generation` — the artwork detail only has the AI generation; the line
 *   carries `generationId` and the template is rendered in the back office
 *   ("Convert to PBN" on the order item), matching the manual production model.
 */
export type PbnPurchaseSource =
  | {
      kind: "saved-pbn";
      /**
       * Resolves a saved PBN: returns the existing one, or saves on demand
       * (redirecting to login if there's no session). Returns null if it
       * couldn't be saved so the caller aborts the add-to-cart.
       */
      ensureSaved: () => Promise<{
        id: string;
        previewUrl?: string | null;
      } | null>;
    }
  | { kind: "generation"; generationId: string };

interface PbnPurchaseCardProps {
  source: PbnPurchaseSource;
  /**
   * Colors of the generated result, drawn on the palette strip + thumb. Empty
   * when ordering straight from an AI artwork, where no palette exists yet.
   */
  palette?: RGB[];
  /** Colored preview (compareImgs.processed data URL) for the thumbnail. */
  previewUrl?: string | null;
}

const swatch = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

/**
 * Purchase card for the Paint-by-Numbers kit, shown right after a result is
 * generated in the studio and on the artwork detail. Reads the real Shopify
 * variants (sizes/prices) via {@link usePbnProduct} and adds the kit to the
 * cart linked back to whatever the entry point has — see
 * {@link PbnPurchaseSource}. From the studio, saving is transparent: the PBN is
 * persisted on demand when the user adds to cart.
 */
export function PbnPurchaseCard({
  source,
  palette = [],
  previewUrl,
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
  const [descExpanded, setDescExpanded] = useState(false);

  const selectedId = variantId ?? defaultVariantId;
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (loading) {
    return (
      <div className="w-full animate-pulse rounded-2xl bg-white p-6">
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
      if (!product) return;
      const line = {
        variantId: selected.id,
        name: product.title,
        size: variantLabel(selected),
        price: unitPrice,
        quantity: qty,
        img: selected.image?.url ?? defaultImage ?? "",
      };
      if (source.kind === "saved-pbn") {
        // Resolving can redirect to login or fail; then nothing reaches the cart.
        const pbn = await source.ensureSaved();
        if (!pbn) return;
        addToCart({
          ...line,
          id: `pbn-${pbn.id}-${selected.id}`,
          paintByNumbersId: pbn.id,
        });
      } else {
        addToCart({
          ...line,
          id: `pbn-gen-${source.generationId}-${selected.id}`,
          generationId: source.generationId,
          imageUrl: previewUrl ?? undefined,
        });
      }
      setAdded(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    // Container query, no viewport: la card se usa a ancho completo en el
    // estudio y dentro de la columna sticky (~440px) del detalle de la obra, así
    // que el split en dos columnas depende de su ancho real, no del de la pantalla.
    <div className="@container h-full w-full">
      <div className="h-full rounded-2xl bg-white p-5 sm:p-6 @2xl:grid @2xl:grid-cols-2 @2xl:gap-x-8">
        {/* Left column when wide: what the kit is. */}
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="grid size-14 shrink-0 grid-cols-3 grid-rows-3 overflow-hidden rounded-xl border border-[#E0DED9] bg-cream bg-cover bg-center"
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
                {palette.length > 0
                  ? `${palette.length}-color kit · printed from your artwork`
                  : "Printed from your artwork"}
              </p>
            </div>
          </div>

          {/* Palette swatches */}
          {palette.length > 0 && (
            <div aria-hidden className="mb-5 flex flex-wrap gap-1.5">
              {palette.map((c, i) => (
                <div
                  key={i}
                  className="h-3.5 w-6 rounded-full"
                  style={{ backgroundColor: swatch(c) }}
                />
              ))}
            </div>
          )}

          {/* Product description — rich HTML authored in the Shopify admin
              (Shopify sanitizes descriptionHtml, so it's a trusted source). */}
          {product?.descriptionHtml ? (
            <div>
              <div
                className={`pbn-desc text-[13px] leading-relaxed text-text-muted ${
                  descExpanded ? "" : "line-clamp-4"
                }`}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
              {product.description.length > 160 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 text-[12px] font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          ) : (
            product?.description && (
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-muted">
                {product.description}
              </p>
            )
          )}
        </div>

        {/* Right column on desktop: configure + buy. */}
        <div className="@2xl:border-l @2xl:border-[#E0DED9] @2xl:pl-8">
          <PurchaseSizePicker
            label="Choose a size"
            ariaLabel="Canvas size"
            value={selected.id}
            onChange={setVariantId}
            options={variants.map((v) => ({
              value: v.id,
              label: variantLabel(v),
              price: formatPrice(
                Number.parseFloat(v.price.amount) || 0,
                v.price.currencyCode,
              ),
            }))}
          />

          <div className="mb-4 h-px bg-[#E0DED9]" />

          {/* Quantity + total */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text-muted">
                Quantity
              </span>
              <div className="flex items-center overflow-hidden rounded-xl border border-[#E0DED9]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="grid size-9 place-items-center text-primary transition-colors hover:bg-cream disabled:text-black/20 disabled:hover:bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    remove
                  </span>
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
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-text-muted">Total</p>
              <p className="font-display sm:text-xl font-black leading-none text-slate-dark">
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
              <span className="material-symbols-outlined text-[20px]">
                shopping_cart
              </span>
              View cart
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-70"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${busy ? "animate-spin" : ""}`}
              >
                {busy ? "progress_activity" : "shopping_bag"}
              </span>
              {busy ? "Adding…" : `Add to cart`}
            </button>
          )}

          {/* Reassurance */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <span className="material-symbols-outlined text-[16px] text-primary">
              local_shipping
            </span>
            ships in 5–7 days
          </div>
          <div className="mt-2 flex items-start justify-center gap-1 text-[11px] text-black/40">
            <span className="material-symbols-outlined text-[13px]">info</span>
            {source.kind === "saved-pbn"
              ? "Printed from the design you generated above."
              : "We turn this artwork into your numbered canvas."}
          </div>
        </div>
      </div>
    </div>
  );
}
