"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { shopifyFetch, GRAPHQL_QUERIES } from "@/lib/shopify";
import { getCollectionProducts } from "@/lib/shopify/actions/collections";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { usePbnProduct } from "./usePbnProduct";

/**
 * Handle of the Shopify collection that groups the generic PBN accessories
 * (paints, brushes, markers, palettes…). Curated entirely in Shopify. If it ever
 * needs to be configurable per-store, the `showcaseCollectionHandle` field on
 * ProductReference sets a precedent for moving it to the backend.
 */
export const ACCESSORIES_COLLECTION_HANDLE = "pbn-accessories";

function formatPrice(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency || "USD",
  }).format(n);
}

interface AccessoryCard {
  productId: string;
  title: string;
  handle: string;
  image: string;
  variantId: string;
  price: { amount: string; currencyCode: string };
  available: boolean;
}

function toCard(node: ShopifyProduct): AccessoryCard | null {
  const variant = node.variants?.edges[0]?.node;
  if (!variant) return null; // no purchasable variant → skip
  const price = variant.price ?? node.priceRange?.minVariantPrice;
  if (!price) return null;
  return {
    productId: node.id,
    title: node.title,
    handle: node.handle,
    image: node.images.edges[0]?.node.url ?? "",
    variantId: variant.id,
    price,
    available: variant.availableForSale,
  };
}

/**
 * Cross-sell strip rendered below the PBN purchase card. Pulls the
 * `pbn-accessories` collection straight from Shopify and offers compact
 * add-to-cart cards. Items go into the cart as plain line items with NO
 * generation/paint-by-numbers attributes — zero coupling with the AI flow.
 * The bundle discount itself is a native Shopify "Buy X Get Y" automatic
 * discount, so nothing is computed here; we only surface the message.
 */
export function AccessoryUpsell() {
  const { addToCart } = useCart();
  // Kit variant used to probe the bundle discount; the hook is also mounted by
  // PbnPurchaseCard on this view, so the duplicate fetch is cheap and keeps
  // this component decoupled.
  const { variants: kitVariants } = usePbnProduct();
  const kitVariantId = kitVariants[0]?.id ?? null;
  const [cards, setCards] = useState<AccessoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  // Real discount observed in Shopify for kit + accessories. null hides the
  // badge (no automatic discount configured or probe failed).
  const [bundleBadge, setBundleBadge] = useState<{
    maxPercent: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCollectionProducts(ACCESSORIES_COLLECTION_HANDLE, 12)
      .then((collection) => {
        if (cancelled) return;
        const nodes = collection?.products.edges.map((e) => e.node) ?? [];
        setCards(nodes.map(toCard).filter((c): c is AccessoryCard => c !== null));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("AccessoryUpsell load error:", err);
        setCards([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Probe the automatic "Buy X Get Y" discount with a throwaway Shopify cart
  // (kit + every available accessory) so the badge reflects the percentage
  // actually configured in Shopify instead of a hardcoded promise.
  useEffect(() => {
    // No sync state reset needed on the guards: bundleBadge starts null and
    // only ever gets a value after a successful probe below.
    if (!kitVariantId || cards.length === 0) return;
    const accessories = cards.filter((c) => c.available);
    if (accessories.length === 0) return;
    let cancelled = false;
    shopifyFetch<{
      cartCreate: {
        cart: {
          lines?: {
            edges: {
              node: {
                merchandise?: { id?: string };
                discountAllocations?: {
                  discountedAmount: { amount: string };
                }[];
              };
            }[];
          };
        } | null;
      };
    }>({
      query: GRAPHQL_QUERIES.CREATE_CART,
      variables: {
        input: {
          lines: [
            { merchandiseId: kitVariantId, quantity: 1 },
            ...accessories.map((c) => ({
              merchandiseId: c.variantId,
              quantity: 1,
            })),
          ],
        },
      },
    })
      .then((response) => {
        if (cancelled) return;
        const edges = response.data.cartCreate.cart?.lines?.edges ?? [];
        const priceByVariant = new Map(
          accessories.map((c) => [
            c.variantId,
            Number.parseFloat(c.price.amount) || 0,
          ]),
        );
        let maxPercent = 0;
        for (const { node } of edges) {
          const price = priceByVariant.get(node.merchandise?.id ?? "");
          if (!price) continue; // kit line (the "Buy" side) or unknown line
          const off = (node.discountAllocations ?? []).reduce(
            (sum, d) =>
              sum + (Number.parseFloat(d.discountedAmount.amount) || 0),
            0,
          );
          maxPercent = Math.max(maxPercent, (off / price) * 100);
        }
        setBundleBadge(
          maxPercent > 0 ? { maxPercent: Math.round(maxPercent) } : null,
        );
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Bundle discount probe failed:", err);
          setBundleBadge(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [kitVariantId, cards]);

  if (loading) {
    return (
      <div className="mt-4 w-full animate-pulse rounded-xl bg-white p-6">
        <div className="h-24 rounded-xl bg-cream" />
      </div>
    );
  }

  if (cards.length === 0) return null;

  const add = (card: AccessoryCard) => {
    if (!card.available) return;
    addToCart({
      id: `accessory-${card.variantId}`,
      variantId: card.variantId,
      name: card.title,
      price: Number.parseFloat(card.price.amount) || 0,
      quantity: 1,
      img: card.image,
    });
    setAddedIds((prev) => new Set(prev).add(card.variantId));
  };

  return (
    <div className="mt-4 w-full rounded-xl bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Complete your kit
          </p>
          <h3 className="font-display text-lg font-black leading-tight text-slate-dark">
            Add paints &amp; brushes
          </h3>
        </div>
        {bundleBadge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
            up to {bundleBadge.maxPercent}% off with your kit
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const added = addedIds.has(card.variantId);
          return (
            <div
              key={card.productId}
              className="flex flex-col overflow-hidden rounded-xl bg-cream"
            >
              <Link href={`/product/${card.handle}`} className="block">
                <div
                  className="aspect-square w-full bg-cover bg-center"
                  style={
                    card.image
                      ? { backgroundImage: `url(${card.image})` }
                      : undefined
                  }
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-slate-dark">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-text-muted">
                    {formatPrice(card.price.amount, card.price.currencyCode)}
                  </p>
                </div>
                {added ? (
                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      shopping_cart
                    </span>
                    In cart
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => add(card)}
                    disabled={!card.available}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-[12px] font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_shopping_cart
                    </span>
                    {card.available ? "Add" : "Sold out"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
