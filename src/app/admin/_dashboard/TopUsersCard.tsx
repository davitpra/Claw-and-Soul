"use client";

import Link from "next/link";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import type { TopUserRow } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { getHandle } from "@/entities/admin/lib/user-format";
import { BarMeter } from "./BarMeter";
import { fmtCount } from "./format";

/**
 * Quién sostiene los ingresos del periodo.
 *
 * Ordenado por gasto de la ventana y no por valor de vida: el resto de la página
 * responde al selector de periodo, y un ranking histórico entre cifras del
 * periodo se leería como una contradicción.
 */
export function TopUsersCard({
  topUsers,
  currency,
  periodLabel,
  loading,
}: {
  topUsers: TopUserRow[];
  currency: string;
  periodLabel: string;
  loading: boolean;
}) {
  const peak = Math.max(...topUsers.map((u) => u.revenue), 1);

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="0">
          <Text variant="headingSm" as="h3">
            Usuarios por valor
          </Text>
          <Text variant="bodySm" as="span" tone="subdued">
            Gasto de los últimos {periodLabel}
          </Text>
        </BlockStack>

        {loading ? (
          <SkeletonBodyText lines={6} />
        ) : topUsers.length === 0 ? (
          <Text as="p" tone="subdued">
            Sin compras de clientes en este periodo.
          </Text>
        ) : (
          <BlockStack gap="0">
            {topUsers.map((user, i) => (
              <div key={user.id}>
                {i > 0 && <Divider />}
                <Box paddingBlock="300">
                  <BlockStack gap="100">
                    <InlineStack align="space-between" blockAlign="baseline">
                      <Link
                        href={`/admin/users/${user.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Text variant="bodyMd" as="span">
                          {displayName(user)}
                        </Text>
                      </Link>
                      <Text variant="bodySm" as="span">
                        {fmtCurrency(user.revenue, currency)}
                      </Text>
                    </InlineStack>
                    <BarMeter value={user.revenue} peak={peak} />
                    <Text variant="bodySm" as="span" tone="subdued">
                      {fmtCount(user.orders)} pedido(s) ·{" "}
                      {fmtCount(user.generations)} generación(es) ·{" "}
                      {fmtCount(user.creditsSpent)} créditos gastados
                    </Text>
                  </BlockStack>
                </Box>
              </div>
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}

/**
 * Tras la purga de PII el email es un identificador sintético, no un contacto:
 * mostrarlo invitaría a escribir a una dirección que ya no existe. La ficha
 * sigue siendo accesible, que es lo que se necesita para auditar el pedido.
 */
function displayName(user: TopUserRow): string {
  if (user.anonymized) return "Cuenta anonimizada";
  return user.fullName ?? getHandle(user.email);
}
