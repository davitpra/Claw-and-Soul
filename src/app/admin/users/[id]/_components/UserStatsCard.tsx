"use client";

import { BlockStack, Card, Text } from "@shopify/polaris";
import { AdminUserDetail } from "@/entities/admin/api";
import { daysSince } from "@/entities/admin/lib/user-format";

interface UserStatsCardProps {
  user: AdminUserDetail;
  photoCount: number;
  /** Total de generaciones; `null` mientras la primera página no ha llegado. */
  generationCount: number | null;
}

/** Contadores de actividad del usuario. */
export function UserStatsCard({
  user,
  photoCount,
  generationCount,
}: UserStatsCardProps) {
  const stats = [
    { label: "Mascotas", value: user.pets.length },
    { label: "Imágenes", value: photoCount },
    { label: "Generaciones IA", value: generationCount ?? "—" },
    { label: "Días desde alta", value: daysSince(user.createdAt) },
  ];

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Estadísticas
        </Text>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 12,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--p-color-bg-surface-secondary)",
                borderRadius: 8,
                padding: 12,
                textAlign: "center",
              }}
            >
              <Text variant="headingLg" as="p">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("es-ES")
                  : stat.value}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {stat.label}
              </Text>
            </div>
          ))}
        </div>
      </BlockStack>
    </Card>
  );
}
