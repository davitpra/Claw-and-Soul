"use client";

import { BlockStack, Box, Card, InlineGrid, Text } from "@shopify/polaris";
import {
  AdminUserCreditEconomics,
  AdminUserDetail,
  AdminUserRevenue,
  CustomerExpenses,
} from "@/entities/admin/api";
import { fmtCreditCost } from "@/entities/admin/lib/credit-format";
import { fmtCurrency } from "@/entities/admin/lib/order-format";

/** Lo que ya carga la página para la card lateral, agrupado para la cabecera. */
export interface UserMoneySummary {
  revenue: AdminUserRevenue | null;
  expenses: CustomerExpenses | null;
  economics: AdminUserCreditEconomics | null;
  loading: boolean;
}

interface UserStatsCardProps {
  user: AdminUserDetail;
  photoCount: number;
  /** Total de generaciones; `null` mientras la primera página no ha llegado. */
  generationCount: number | null;
  money: UserMoneySummary;
}

interface Stat {
  label: string;
  value: string;
  /** Contexto del número; solo lo llevan las cifras de dinero. */
  detail?: string;
  /** Atenúa el importe: lo proyectado no se lee igual que lo ya ocurrido. */
  projected?: boolean;
}

/**
 * Fila de contadores de actividad, al ancho del header, con las cifras de dinero
 * de la cuenta debajo. Sin título propio: se lee como una extensión de la
 * cabecera, igual que la ficha de cliente del admin de Shopify.
 */
export function UserStatsCard({
  user,
  photoCount,
  generationCount,
  money,
}: UserStatsCardProps) {
  const activity: Stat[] = [
    { label: "Mascotas", value: fmtCount(user.pets.length) },
    { label: "Imágenes", value: fmtCount(photoCount) },
    { label: "Generaciones IA", value: fmtCount(generationCount) },
  ];

  const balance = buildBalance(money);

  return (
    // Sin padding en la card para que los divisores lleguen de borde a borde;
    // cada celda pone el suyo.
    <Card padding="0">
      <StatRow stats={activity} />

      {/* Fila aparte y sobre fondo gris: el dinero es otra lectura, y con las
          mismas columnas que arriba los divisores de ambas filas se alinean. */}
      {balance.length > 0 && (
        <Box
          borderBlockStartWidth="025"
          borderColor="border"
          background="bg-surface-secondary"
        >
          <StatRow stats={balance} />
        </Box>
      )}
    </Card>
  );
}

/**
 * Las columnas salen del número de celdas: con una rejilla fija sobraba media
 * fila cuando cambiaba la lista de contadores, y los divisores dejaban de
 * cuadrar con los de la fila de abajo.
 */
function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <InlineGrid columns={{ xs: 1, sm: stats.length }} gap="0">
      {stats.map((stat, i) => (
        <Box
          key={stat.label}
          padding="400"
          borderInlineStartWidth={i === 0 ? "0" : "025"}
          borderColor="border"
        >
          <BlockStack gap="050">
            <Text variant="bodySm" as="span" tone="subdued">
              {stat.label}
            </Text>
            <Text
              variant="headingMd"
              as="span"
              tone={stat.projected ? "subdued" : undefined}
            >
              {stat.value}
            </Text>
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

/**
 * Ingresos, gastos y costo por incurrir con el mismo criterio que la ficha:
 * pedidos pagados, movimientos ya registrados y el saldo de créditos valorado al
 * costo medio. Los importes van en la moneda base del backend, de ahí el "≈".
 */
function buildBalance({
  revenue,
  expenses,
  economics,
  loading,
}: UserMoneySummary): Stat[] {
  // Los tres fetch son best-effort: sin ninguno cargado no hay ni moneda con la
  // que formatear, y la fila entera se omite.
  const currency =
    revenue?.baseCurrency ?? expenses?.baseCurrency ?? economics?.baseCurrency;

  if (loading || !currency) return [];

  return [
    {
      label: "Ingresos",
      value: `≈ ${fmtCurrency(revenue?.total ?? 0, currency)}`,
      detail: `${fmtCount(revenue?.orderCount ?? 0)} pedido(s) pagado(s)`,
    },
    {
      label: "Gastado",
      value: `≈ ${fmtCurrency(expenses?.grandTotal ?? 0, currency)}`,
      detail: `${fmtCount(expenses?.count ?? 0)} movimiento(s)`,
    },
    {
      label: "Costo futuro",
      // Sin saldo no hay nada pendiente, y sin costo medio nada que estimar: en
      // ambos casos "—" antes que un 0 que se lea como dato.
      value:
        economics && economics.balance > 0 && economics.unitCost !== null
          ? `≈ ${fmtCreditCost(economics.outstandingLiability, currency)}`
          : "—",
      detail: `${fmtCount(economics?.balance ?? 0)} crédito(s) sin gastar`,
      projected: true,
    },
  ];
}

function fmtCount(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("es-ES");
}
