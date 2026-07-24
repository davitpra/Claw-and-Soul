"use client";

import { useCallback, useState } from "react";
import { shopifyFetch, GRAPHQL_QUERIES } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Resultado de `startCheckout`. `redirect` significa que ya se está navegando a
 * la URL de checkout de Shopify (el caller no debe hacer nada más). El resto son
 * fallos que cada caller reporta a su manera (alert en /cart, mensaje inline en
 * el generador IA).
 * - `empty`: el carrito local no tiene items.
 * - `no-variants`: hay items pero ninguno con `variantId` válido de Shopify.
 * - `error`: `userErrors` de Shopify o excepción de red.
 */
export type CheckoutStatus = "redirect" | "empty" | "no-variants" | "error";

export interface CheckoutResult {
  status: CheckoutStatus;
  message?: string;
}

/**
 * Fuente única del flujo de checkout de Shopify, compartida por la página de
 * carrito (`/cart`) y la pantalla de agradecimiento del generador IA. Arma las
 * líneas del carrito (con los attributes que lee el webhook de órdenes:
 * `_user_id`, `generation_id`, `image_url`, etc.), crea el carrito en Shopify,
 * vacía nuestro carrito local y redirige a la URL de checkout.
 */
export function useShopifyCheckout() {
  const { items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Build the Shopify cart lines from our local cart. Line attributes become
  // Shopify order line-item `properties`, which the orders webhook
  // (`ingestLineItem`) reads to re-associate the art. Accessories carry no
  // generation/paint-by-numbers attributes, so they stay decoupled.
  const buildLines = useCallback(() => {
    return items
      .map((item) => {
        const attributes = [
          { key: "Style", value: item.style || "Default" },
          // _user_id (prefijo "_" → Shopify lo oculta al cliente) permite al
          // webhook acreditar/vincular la orden a la cuenta correcta sin
          // depender del email tecleado en el checkout.
          ...(isAuthenticated && user
            ? [{ key: "_user_id", value: user.id }]
            : []),
          ...(item.paintByNumbersId
            ? [{ key: "paint_by_numbers_id", value: item.paintByNumbersId }]
            : []),
          ...(item.generationId
            ? [{ key: "generation_id", value: item.generationId }]
            : []),
          ...(item.generationId && item.imageUrl
            ? [{ key: "image_url", value: item.imageUrl }]
            : []),
        ];
        return {
          merchandiseId: item.variantId || "",
          quantity: item.quantity,
          attributes,
        };
      })
      .filter((line) => line.merchandiseId !== "");
  }, [items, isAuthenticated, user]);

  const startCheckout = useCallback(async (): Promise<CheckoutResult> => {
    if (items.length === 0) return { status: "empty" };

    setIsCheckingOut(true);
    try {
      const lines = buildLines();

      if (lines.length === 0) {
        setIsCheckingOut(false);
        return { status: "no-variants" };
      }

      const response = await shopifyFetch<{
        cartCreate: {
          cart: { checkoutUrl: string };
          userErrors: { field?: string[]; message: string }[];
        };
      }>({
        query: GRAPHQL_QUERIES.CREATE_CART,
        variables: {
          input: {
            lines: lines,
          },
        },
      });

      const { cart, userErrors } = response.data.cartCreate;

      if (userErrors && userErrors.length > 0) {
        console.error("Shopify checkout errors:", userErrors);
        setIsCheckingOut(false);
        return { status: "error", message: userErrors[0].message };
      }

      if (cart?.checkoutUrl) {
        // Shopify cart created — empty our cart before handing off to checkout
        await clearCart();
        window.location.href = cart.checkoutUrl;
        return { status: "redirect" };
      }

      setIsCheckingOut(false);
      return { status: "error" };
    } catch (error) {
      console.error("Checkout failed:", error);
      setIsCheckingOut(false);
      return { status: "error" };
    }
  }, [items, buildLines, clearCart]);

  return { startCheckout, buildLines, isCheckingOut };
}
