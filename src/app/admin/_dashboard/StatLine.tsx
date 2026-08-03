"use client";

import { BlockStack, InlineStack, Text } from "@shopify/polaris";

interface StatLineProps {
  label: string;
  value: string;
  /** Contexto bajo la etiqueta: base de comparación, muestra, salvedad… */
  detail?: string;
  /** Variación ya formateada (`+12,4 %`); `null`/ausente no pinta nada. */
  delta?: string | null;
  deltaTone?: "success" | "critical";
  /** Destaca la línea: la usan los totales de un bloque. */
  strong?: boolean;
  /** Atenúa la línea: lo estimado no se lee igual que lo ya ocurrido. */
  projected?: boolean;
  tone?: "critical";
}

/**
 * Renglón «etiqueta a la izquierda, cifra a la derecha» de las cards del
 * dashboard. Vivía duplicado en `MoneyCard` y `GrowthFunnelCard`; se extrajo al
 * añadir `CreditsCard`, que habría sido la tercera copia.
 */
export function StatLine({
  label,
  value,
  detail,
  delta,
  deltaTone,
  strong,
  projected,
  tone,
}: StatLineProps) {
  return (
    <InlineStack align="space-between" blockAlign="start">
      <BlockStack gap="0">
        <Text
          variant={strong ? "bodyMd" : "bodySm"}
          as="span"
          fontWeight={strong ? "semibold" : undefined}
          tone={projected ? "subdued" : undefined}
        >
          {label}
        </Text>
        {detail && (
          <Text variant="bodySm" as="span" tone="subdued">
            {detail}
          </Text>
        )}
      </BlockStack>
      <InlineStack gap="200" blockAlign="baseline" wrap={false}>
        <Text
          variant={strong ? "bodyMd" : "bodySm"}
          as="span"
          fontWeight={strong ? "semibold" : undefined}
          tone={tone ?? (projected ? "subdued" : undefined)}
        >
          {value}
        </Text>
        {delta && (
          <Text variant="bodySm" as="span" tone={deltaTone}>
            {delta}
          </Text>
        )}
      </InlineStack>
    </InlineStack>
  );
}
