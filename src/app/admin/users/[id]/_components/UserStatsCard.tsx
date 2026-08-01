"use client";

import { BlockStack, Box, Card, InlineGrid, Text } from "@shopify/polaris";
import { AdminUserDetail } from "@/entities/admin/api";

interface UserStatsCardProps {
  user: AdminUserDetail;
  photoCount: number;
  /** Total de generaciones; `null` mientras la primera página no ha llegado. */
  generationCount: number | null;
}

/**
 * Fila de contadores de actividad, al ancho del header. Sin título propio: se
 * lee como una extensión de la cabecera, igual que la ficha de cliente del
 * admin de Shopify.
 */
export function UserStatsCard({
  user,
  photoCount,
  generationCount,
}: UserStatsCardProps) {
  const stats = [
    { label: "Mascotas", value: user.pets.length },
    { label: "Imágenes", value: photoCount },
    { label: "Generaciones IA", value: generationCount ?? "—" },
    { label: "Créditos gastados", value: user.creditsSpent },
  ];

  return (
    // Sin padding en la card para que los divisores lleguen de borde a borde;
    // cada celda pone el suyo.
    <Card padding="0">
      <InlineGrid columns={{ xs: 2, md: 4 }} gap="0">
        {stats.map((stat, i) => (
          <Box
            key={stat.label}
            padding="400"
            borderInlineStartWidth={i === 0 ? "0" : "025"}
            borderColor="border"
          >
            <BlockStack gap="100">
              <Text variant="bodySm" fontWeight="semibold" as="span">
                {stat.label}
              </Text>
              <Text variant="bodyMd" as="span">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("es-ES")
                  : stat.value}
              </Text>
            </BlockStack>
          </Box>
        ))}
      </InlineGrid>
    </Card>
  );
}
