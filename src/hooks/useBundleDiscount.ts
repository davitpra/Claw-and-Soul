"use client";

import { useEffect, useState } from "react";
import { shopifyFetch, GRAPHQL_QUERIES } from "@/lib/shopify";

type DiscountAllocation = {
  discountedAmount: { amount: string; currencyCode: string };
  title?: string;
};

type CartPreviewResponse = {
  cartCreate: {
    cart: {
      cost?: { subtotalAmount?: { currencyCode: string } };
      discountAllocations?: DiscountAllocation[];
      lines?: {
        edges: {
          node: {
            merchandise?: { id?: string };
            discountAllocations?: DiscountAllocation[];
          };
        }[];
      };
    } | null;
  };
};

/**
 * Descuento automático "Buy X Get Y" de Shopify aplicado al carrito actual.
 * `title` es el nombre del descuento en el admin de Shopify; `byVariant` mapea
 * cada variantId descontado a su ahorro de línea, para poder tachar precios.
 */
export interface BundleDiscount {
  amount: number;
  currency: string;
  title: string | null;
  byVariant: Record<string, number>;
}

const sumAmounts = (allocations: DiscountAllocation[]) =>
  allocations.reduce(
    (sum, d) => sum + (Number.parseFloat(d.discountedAmount.amount) || 0),
    0,
  );

/**
 * Previsualiza el descuento automático del carrito creando un carrito
 * desechable en Shopify y leyendo sus `discountAllocations`. Devuelve `null`
 * mientras no se conoce o cuando el carrito no califica.
 *
 * Va con debounce para que editar cantidades rápido no dispare una llamada por
 * pulsación. El carrito real de checkout se crea aparte, al pulsar "Checkout".
 */
export function useBundleDiscount(
  buildLines: () => { merchandiseId: string; quantity: number }[],
): BundleDiscount | null {
  const [discount, setDiscount] = useState<BundleDiscount | null>(null);

  useEffect(() => {
    const lines = buildLines();
    let cancelled = false;

    const timer = setTimeout(async () => {
      // Carrito vacío: no hay nada que previsualizar. El reset va dentro del
      // timeout para no llamar setState de forma síncrona en el efecto.
      if (lines.length === 0) {
        if (!cancelled) setDiscount(null);
        return;
      }
      try {
        const response = await shopifyFetch<CartPreviewResponse>({
          query: GRAPHQL_QUERIES.CREATE_CART,
          variables: { input: { lines } },
        });
        if (cancelled) return;

        const cart = response.data.cartCreate.cart;
        const lineEdges = cart?.lines?.edges ?? [];

        // Los BXGY se asignan por línea; los descuentos de carrito completo
        // llegan a nivel de carrito. Sumamos ambos para el ahorro total y
        // guardamos el monto por variante para el precio tachado de cada ítem.
        const byVariant: Record<string, number> = {};
        for (const { node } of lineEdges) {
          const variantId = node.merchandise?.id;
          if (!variantId) continue;
          const lineTotal = sumAmounts(node.discountAllocations ?? []);
          if (lineTotal > 0) byVariant[variantId] = lineTotal;
        }

        const allocations = [
          ...(cart?.discountAllocations ?? []),
          ...lineEdges.flatMap(({ node }) => node.discountAllocations ?? []),
        ];
        const amount = sumAmounts(allocations);

        setDiscount(
          amount > 0
            ? {
                amount,
                currency:
                  allocations[0]?.discountedAmount.currencyCode ??
                  cart?.cost?.subtotalAmount?.currencyCode ??
                  "USD",
                title:
                  allocations.find(
                    (d) =>
                      d.title &&
                      Number.parseFloat(d.discountedAmount.amount) > 0,
                  )?.title ?? null,
                byVariant,
              }
            : null,
        );
      } catch (error) {
        if (cancelled) return;
        console.error("Cart discount preview failed:", error);
        setDiscount(null);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [buildLines]);

  return discount;
}
