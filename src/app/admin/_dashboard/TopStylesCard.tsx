"use client";

import Link from "next/link";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { OverviewStats } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { BarMeter } from "./BarMeter";
import { fmtCount } from "./format";

/**
 * Estilos ordenados por INGRESOS, no por uso.
 *
 * El dashboard anterior los ordenaba por número de generaciones, lo que premiaba
 * al estilo con el que la gente juega y no al que compra. El conteo se conserva
 * como dato secundario.
 */
export function TopStylesCard({
  topStyles,
  currency,
}: {
  topStyles: OverviewStats["topStyles"];
  currency: string;
}) {
  const peak = Math.max(...topStyles.map((s) => s.revenue), 1);

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">
          Ingresos por Estilo
        </Text>

        {topStyles.length === 0 ? (
          <Text as="p" tone="subdued">
            Sin actividad de estilos en este periodo.
          </Text>
        ) : (
          <BlockStack gap="0">
            {topStyles.map((style, i) => (
              <div key={style.styleId}>
                {i > 0 && <Divider />}
                <Box paddingBlock="300">
                  <BlockStack gap="100">
                    <InlineStack align="space-between" blockAlign="baseline">
                      <Link
                        href={`/admin/styles/${style.styleId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Text variant="bodyMd" as="span">
                          {style.displayName}
                        </Text>
                      </Link>
                      <Text variant="bodySm" as="span">
                        {fmtCurrency(style.revenue, currency)}
                      </Text>
                    </InlineStack>
                    <BarMeter value={style.revenue} peak={peak} />
                    <Text variant="bodySm" as="span" tone="subdued">
                      {fmtCount(style.count)} generación(es)
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
