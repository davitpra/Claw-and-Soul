"use client";

import { useEffect, useState } from "react";
import { shopifyFetch, GRAPHQL_QUERIES } from "@/lib/shopify";
import { getCollectionProducts } from "@/lib/shopify/actions/collections";
import type { ShopifyPrice, ShopifyVariant } from "@/lib/shopify/types";
import { usePbnProduct } from "./usePbnProduct";

/**
 * Handle of the Shopify collection that groups the generic PBN accessories
 * (paints, brushes, markers, palettes…). Curated entirely in Shopify. If it ever
 * needs to be configurable per-store, the `showcaseCollectionHandle` field on
 * ProductReference sets a precedent for moving it to the backend.
 */
export const ACCESSORIES_COLLECTION_HANDLE = "pbn-accessories";

export interface AccessoryCard {
  productId: string;
  title: string;
  handle: string;
  description: string;
  /** Variant title when the product has a real one ("20-piece set"), else null. */
  subtitle: string | null;
  image: string;
  variantId: string;
  price: { amount: string; currencyCode: string };
  available: boolean;
}

/**
 * Forma estructural mínima que necesita `toAccessoryCard`; la cumplen tanto
 * `ShopifyProduct` como `ShopifyProductReference` (con variantes pedidas).
 */
interface AccessorySource {
  id: string;
  title: string;
  handle: string;
  description?: string;
  images: { edges: { node: { url: string } }[] };
  variants?: {
    edges: {
      node: Pick<ShopifyVariant, "id" | "title" | "availableForSale"> & {
        price?: ShopifyPrice;
      };
    }[];
  };
  priceRange?: { minVariantPrice: ShopifyPrice };
}

export function toAccessoryCard(node: AccessorySource): AccessoryCard | null {
  const variant = node.variants?.edges[0]?.node;
  if (!variant) return null; // no purchasable variant → skip
  const price = variant.price ?? node.priceRange?.minVariantPrice;
  if (!price) return null;
  const variantTitle = variant.title?.trim() ?? "";
  return {
    productId: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description ?? "",
    subtitle:
      variantTitle && variantTitle.toLowerCase() !== "default title"
        ? variantTitle
        : null,
    image: node.images.edges[0]?.node.url ?? "",
    variantId: variant.id,
    price,
    available: variant.availableForSale,
  };
}

interface UsePbnAccessoriesResult {
  accessories: AccessoryCard[];
  loading: boolean;
  /**
   * true once the PBN kit product resolved with at least one purchasable
   * variant. Lets a consumer skip the whole cross-sell block when the store has
   * neither kit nor accessories, instead of rendering an empty carousel.
   */
  kitAvailable: boolean;
  /**
   * Discount actually configured in Shopify for kit + accessories, as a rounded
   * percentage. null when there is no automatic discount (or the probe failed),
   * in which case no promo copy should be shown.
   */
  bundlePercent: number | null;
}

/**
 * Loads the `pbn-accessories` collection from Shopify for the cross-sell shown
 * next to the PBN purchase card, and probes the real bundle discount.
 *
 * The bundle discount is a native Shopify "Buy X Get Y" automatic discount, so
 * nothing is computed here: we create a throwaway Shopify cart (kit + every
 * available accessory) and read back the allocations, which keeps the promo copy
 * honest instead of hardcoding a promise.
 *
 * `enabled` turns the whole thing off — four requests, one of them a `cartCreate`
 * mutation. The artwork detail shows the source product's own related products
 * instead, and only needs this when it falls back to the kit.
 */
export function usePbnAccessories(enabled = true): UsePbnAccessoriesResult {
  // Kit variant used to probe the bundle discount; the hook is also mounted by
  // PbnPurchaseCard on this view, so the duplicate fetch is cheap and keeps
  // this hook decoupled.
  const {
    variants: kitVariants,
    loading: kitLoading,
    unavailable: kitUnavailable,
  } = usePbnProduct(enabled);
  const kitVariantId = kitVariants[0]?.id ?? null;
  const [accessories, setAccessories] = useState<AccessoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [bundlePercent, setBundlePercent] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getCollectionProducts(ACCESSORIES_COLLECTION_HANDLE, 12)
      .then((collection) => {
        if (cancelled) return;
        const nodes = collection?.products.edges.map((e) => e.node) ?? [];
        setAccessories(
          nodes
            .map(toAccessoryCard)
            .filter((c): c is AccessoryCard => c !== null),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("PBN accessories load error:", err);
        setAccessories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    // No sync state reset needed on the guards: bundlePercent starts null and
    // only ever gets a value after a successful probe below.
    if (!enabled || !kitVariantId || accessories.length === 0) return;
    const available = accessories.filter((c) => c.available);
    if (available.length === 0) return;
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
            ...available.map((c) => ({
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
          available.map((c) => [
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
        setBundlePercent(maxPercent > 0 ? Math.round(maxPercent) : null);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Bundle discount probe failed:", err);
          setBundlePercent(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, kitVariantId, accessories]);

  return {
    accessories,
    // Apagado no hay peticiones en vuelo, así que nadie debe esperar por ellas.
    loading: enabled && (loading || kitLoading),
    kitAvailable: !kitUnavailable && kitVariantId !== null,
    bundlePercent,
  };
}
