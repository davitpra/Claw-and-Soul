"use client";

import { useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { AdminUserCart, AdminUserCartItem } from "@/entities/admin/api";
import { fmtRelativeTime } from "@/entities/admin/lib/user-format";

/**
 * Carrito abierto del usuario: señal de intención de compra que no llega a
 * pedido. No se renderiza si no hay carrito, así que la card solo aparece en
 * las fichas que tienen algo que contar.
 *
 * Los importes van sin símbolo de moneda a propósito: `CartItem` no guarda la
 * moneda y los precios vienen del Storefront de Shopify.
 */
export function UserCartCard({ cart }: { cart: AdminUserCart | null }) {
  const [open, setOpen] = useState(false);

  if (!cart) return null;

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Carrito abierto
        </Text>

        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="050">
            <Text variant="headingLg" as="span">
              {cart.subtotal.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text variant="bodySm" tone="subdued" as="span">
              {cart.itemCount} artículo(s) en {cart.lineCount} línea(s)
            </Text>
          </BlockStack>
          <Button
            variant="plain"
            disclosure={open ? "up" : "down"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Ocultar" : "Ver líneas"}
          </Button>
        </InlineStack>

        <Text variant="bodySm" tone="subdued" as="span">
          Actualizado {fmtRelativeTime(cart.updatedAt).toLowerCase()}
        </Text>

        <Collapsible open={open} id="user-cart-lines">
          <BlockStack gap="300">
            {cart.items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

function CartLine({ item }: { item: AdminUserCartItem }) {
  const variant = [item.size, item.style, item.color]
    .filter(Boolean)
    .join(" · ");

  return (
    <InlineStack gap="300" blockAlign="center" wrap={false}>
      {/* `<img>` propio en vez de `Thumbnail`: el de Polaris no expone
          `onError` y estas imágenes son de Cloudinary/Shopify. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt=""
        loading="lazy"
        style={{
          width: 40,
          height: 40,
          objectFit: "cover",
          borderRadius: 8,
          flexShrink: 0,
        }}
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
      <Box width="100%">
        <BlockStack gap="050">
          <Text variant="bodySm" as="span" fontWeight="medium">
            {item.name}
          </Text>
          <Text variant="bodySm" tone="subdued" as="span">
            {variant || "Sin variante"} · x{item.quantity}
          </Text>
        </BlockStack>
      </Box>
      <Text variant="bodySm" as="span">
        {(item.price * item.quantity).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </InlineStack>
  );
}
