"use client";

import {
  BlockStack,
  Box,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import type { IconSource } from "@shopify/polaris";

export interface Stat {
  label: string;
  value: string;
  /** Mismo icono que la sección que desarrolla la cifra, para poder atarlas. */
  icon?: IconSource;
  /** Contexto bajo la cifra: base de comparación, muestra, unidad… */
  detail?: string;
  /** Variación ya formateada (`+12,4 %`); `null`/ausente no pinta nada. */
  delta?: string | null;
  deltaTone?: "success" | "critical";
  /** Atenúa el valor: lo estimado no se lee igual que lo ya ocurrido. */
  projected?: boolean;
  /** Celda cuyo detalle se está mostrando debajo; se tiñe el fondo. */
  selected?: boolean;
}

/**
 * Fila de cifras con divisores borde a borde, el mismo patrón que
 * `admin/users/[id]/_components/UserStatsCard.tsx`.
 *
 * Las columnas salen del número de celdas para que los divisores de dos filas
 * apiladas se alineen; con una rejilla fija sobraba media fila al cambiar la
 * lista de contadores.
 */
export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <InlineGrid columns={{ xs: 1, sm: 2, md: stats.length }} gap="0">
      {stats.map((stat, i) => (
        <Box
          key={stat.label}
          padding="400"
          borderInlineStartWidth={i === 0 ? "0" : "025"}
          borderColor="border"
          background={stat.selected ? "bg-surface-secondary" : undefined}
        >
          <BlockStack gap="050">
            <InlineStack gap="100" blockAlign="center" wrap={false}>
              {stat.icon && (
                <Icon source={stat.icon} tone={stat.selected ? "base" : "subdued"} />
              )}
              <Text
                variant="bodySm"
                as="span"
                tone={stat.selected ? undefined : "subdued"}
                fontWeight={stat.selected ? "semibold" : undefined}
              >
                {stat.label}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="baseline" wrap={false}>
              <Text
                variant="headingLg"
                as="span"
                tone={stat.projected ? "subdued" : undefined}
              >
                {stat.value}
              </Text>
              {stat.delta && (
                <Text variant="bodySm" as="span" tone={stat.deltaTone}>
                  {stat.delta}
                </Text>
              )}
            </InlineStack>
            {stat.detail && (
              <Text variant="bodySm" as="span" tone="subdued">
                {stat.detail}
              </Text>
            )}
          </BlockStack>
        </Box>
      ))}
    </InlineGrid>
  );
}
