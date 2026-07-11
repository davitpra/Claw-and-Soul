"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { ShopifyVariant } from "@/lib/shopify/types";
import { usePbnProduct } from "./usePbnProduct";

interface PbnBuyButtonProps {
  pbn: { id: string; previewUrl?: string | null } | null;
  /** Visual style: full-width primary (library card) or inline (generator). */
  variant?: "block" | "inline";
  className?: string;
}

function variantLabel(v: ShopifyVariant): string {
  const size = v.selectedOptions.find((o) => /size|tama/i.test(o.name));
  return size?.value ?? v.title;
}

function formatPrice(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency || "USD",
  }).format(n);
}

/**
 * "Comprar" action for a saved Paint-by-Numbers. Adds the dedicated PBN Shopify
 * product to the cart, carrying `paintByNumbersId` so checkout + the orders
 * webhook re-associate the saved art. Shows a size picker when the product has
 * more than one variant.
 */
export function PbnBuyButton({
  pbn,
  variant = "block",
  className = "",
}: PbnBuyButtonProps) {
  const { product, variants, defaultImage, loading, unavailable } =
    usePbnProduct();
  const { addToCart } = useCart();
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);

  const addVariant = (v: ShopifyVariant) => {
    if (!product || !pbn) return;
    addToCart({
      id: `pbn-${pbn.id}-${v.id}`,
      variantId: v.id,
      name: product.title,
      size: variantLabel(v),
      price: Number.parseFloat(v.price.amount) || 0,
      quantity: 1,
      img: pbn.previewUrl ?? defaultImage ?? "",
      paintByNumbersId: pbn.id,
      imageUrl: pbn.previewUrl ?? undefined,
    });
    setPicking(false);
    setAdded(true);
  };

  const handleClick = () => {
    if (variants.length === 1) addVariant(variants[0]);
    else setPicking(true);
  };

  const base =
    variant === "block"
      ? "w-full rounded-xl px-4 py-2.5 text-sm font-bold"
      : "rounded-xl px-5 py-2.5 text-sm font-bold";

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className={`${base} bg-cream text-text-muted ${className}`}
      >
        Cargando…
      </button>
    );
  }

  if (!pbn || unavailable || variants.length === 0) return null;

  if (added) {
    return (
      <Link
        href="/cart"
        className={`${base} inline-flex items-center justify-center gap-1.5 bg-primary/10 text-primary transition-colors hover:bg-primary/20 ${className}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          shopping_cart
        </span>
        Ver carrito
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`${base} inline-flex items-center justify-center gap-1.5 bg-primary text-white transition-all hover:bg-primary-dark hover:shadow-md ${className}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          shopping_bag
        </span>
        Comprar
      </button>

      {picking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPicking(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-black text-text-main">
              Elige un tamaño
            </h3>
            <p className="mt-1 text-sm text-text-muted">{product?.title}</p>
            <div className="mt-4 flex flex-col gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => addVariant(v)}
                  className="flex items-center justify-between rounded-xl border border-cream px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-text-main">
                    {variantLabel(v)}
                  </span>
                  <span className="text-sm text-text-muted">
                    {formatPrice(v.price.amount, v.price.currencyCode)}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-cream"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
