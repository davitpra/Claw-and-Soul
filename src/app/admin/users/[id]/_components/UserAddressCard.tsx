"use client";

import { BlockStack, Card, Text } from "@shopify/polaris";
import { AdminUserShippingAddress } from "@/entities/admin/api";
import { fmtShortDate } from "@/entities/admin/lib/order-format";

/**
 * Dirección de envío del usuario. Sale de su pedido más reciente, así que solo
 * aparece si ha comprado alguna vez; sin pedidos no se renderiza nada.
 */
export function UserAddressCard({
  address,
}: {
  address: AdminUserShippingAddress | null;
}) {
  if (!address?.address) return null;

  const a = address.address;
  const recipient = [a.first_name, a.last_name].filter(Boolean).join(" ");
  const cityLine = [a.city, a.province, a.zip].filter(Boolean).join(" ");

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Dirección de envío
        </Text>

        {/* En líneas y no con `formatAddress`: una dirección postal en una sola
            línea separada por comas se lee peor que el bloque de siempre. */}
        <BlockStack gap="050">
          {recipient && (
            <Text variant="bodyMd" as="span" fontWeight="medium">
              {recipient}
            </Text>
          )}
          {a.address1 && (
            <Text variant="bodyMd" as="span">
              {a.address1}
            </Text>
          )}
          {a.address2 && (
            <Text variant="bodyMd" as="span">
              {a.address2}
            </Text>
          )}
          {cityLine && (
            <Text variant="bodyMd" as="span">
              {cityLine}
            </Text>
          )}
          {a.country && (
            <Text variant="bodyMd" as="span">
              {a.country}
            </Text>
          )}
        </BlockStack>

        {address.phone && (
          <BlockStack gap="050">
            <Text variant="bodySm" tone="subdued" as="span">
              Teléfono
            </Text>
            <Text variant="bodyMd" as="span">
              {address.phone}
            </Text>
          </BlockStack>
        )}

        {/* Una dirección de hace dos años puede estar caducada: de qué pedido
            viene es parte del dato. */}
        <Text variant="bodySm" tone="subdued" as="span">
          Del pedido #{address.sourceOrderNumber} ·{" "}
          {fmtShortDate(address.sourceOrderDate)}
        </Text>
      </BlockStack>
    </Card>
  );
}
