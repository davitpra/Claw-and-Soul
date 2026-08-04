"use client";

import { Box } from "@shopify/polaris";

/**
 * Barra de proporción de las cards del dashboard.
 *
 * Estaba copiada en `GrowthFunnelCard` y `TopStylesCard`; con la segmentación y
 * la cohorte de usuarios iban a ser cuatro copias del mismo par de `Box`.
 */
export function BarMeter({
  value,
  peak,
  tone = "brand",
}: {
  value: number;
  /** Valor que ocupa el 100 % de la barra. */
  peak: number;
  tone?: "brand" | "critical";
}) {
  // Un valor distinto de cero nunca se pinta como barra vacía: un 1 sobre 4.000
  // sería invisible y se leería como ausencia de dato.
  const width = peak > 0 ? (value / peak) * 100 : 0;

  return (
    <Box background="bg-surface-secondary" borderRadius="100" minHeight="6px">
      <Box
        background={tone === "critical" ? "bg-fill-critical" : "bg-fill-brand"}
        borderRadius="100"
        minHeight="6px"
        width={`${Math.max(width, value ? 2 : 0)}%`}
      />
    </Box>
  );
}
