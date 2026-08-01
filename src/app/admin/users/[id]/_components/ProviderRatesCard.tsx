"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  BlockStack,
  Card,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import { adminApi, ProviderRate } from "@/entities/admin/api";
import { fmtRate, RATE_UNIT_LABELS } from "@/entities/admin/lib/provider-rate";

/**
 * Tarifas de proveedor vigentes, en solo lectura. Sirven para detectar precios
 * mal configurados —sobre todo los que están a 0, que hacen que los gastos se
 * registren en cero sin avisar—, no para explicar los importes de la lista: un
 * gasto congela la tarifa que había al apuntarlo, así que estos números
 * describen lo que costará lo próximo, no lo ya registrado.
 *
 * Se editan en `/admin/expenses`, que es donde vive el formulario.
 */
export function ProviderRatesCard() {
  const [rates, setRates] = useState<ProviderRate[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi.expenseRates
      .list()
      .then((data) => {
        if (!cancelled) setRates(data);
      })
      .catch(() => {
        if (!cancelled) setRates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="050">
          <Text variant="headingSm" as="h3">
            Tarifas de proveedor vigentes
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Precios con los que se registran los gastos nuevos. Los ya
            registrados conservan la tarifa que había en su momento.
          </Text>
        </BlockStack>

        {rates === null && (
          <InlineStack gap="200" blockAlign="center">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando tarifas…
            </Text>
          </InlineStack>
        )}

        {rates?.length === 0 && (
          <Text as="p" tone="subdued">
            No hay tarifas configuradas.
          </Text>
        )}

        {rates?.map((rate) => (
          <InlineStack key={rate.id} align="space-between" blockAlign="center" gap="200">
            <BlockStack gap="050">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                {rate.model}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                {rate.provider} · {RATE_UNIT_LABELS[rate.unit] ?? rate.unit}
              </Text>
            </BlockStack>
            <InlineStack gap="200" blockAlign="center">
              {/* Un modelo sin tarifa se auto-registra a 0 y sus gastos salen
                  en cero: conviene que salte a la vista. */}
              {rate.amount === 0 && <Badge tone="warning">Sin configurar</Badge>}
              {!rate.isActive && <Badge>Inactiva</Badge>}
              <Text as="span" variant="bodySm">
                {fmtRate(rate.amount, rate.currency)}
              </Text>
            </InlineStack>
          </InlineStack>
        ))}

        <Link href="/admin/expenses" style={{ color: "var(--p-color-text-emphasis)" }}>
          <Text as="span" variant="bodySm">
            Editar tarifas en Gastos
          </Text>
        </Link>
      </BlockStack>
    </Card>
  );
}
