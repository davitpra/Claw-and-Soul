"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Banner,
  Button,
  Spinner,
  Text,
  TextField,
  InlineStack,
  BlockStack,
  Box,
  IndexTable,
} from "@shopify/polaris";
import { adminApi, AdminCreditPackVariant } from "@/entities/admin/api";

type CreditPackVariantsCardProps = {
  productId: string;
};

/**
 * Mapeo variante Shopify → créditos para el producto marcado como credit pack.
 * Autocontenido: carga las variantes vivas + su mapeo actual y las guarda en
 * bloque (full-replace). Solo se monta cuando el producto es un credit pack.
 */
export function CreditPackVariantsCard({
  productId,
}: CreditPackVariantsCardProps) {
  const [variants, setVariants] = useState<AdminCreditPackVariant[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.products
      .getCreditPackVariants(productId)
      .then((res) => {
        setVariants(res.variants);
        setAmounts(
          Object.fromEntries(
            res.variants.map((v) => [
              v.shopifyVariantId,
              v.creditAmount != null ? String(v.creditAmount) : "",
            ]),
          ),
        );
      })
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = Object.entries(amounts)
        .map(([shopifyVariantId, raw]) => ({
          shopifyVariantId,
          creditAmount: Number.parseInt(raw, 10),
        }))
        .filter((v) => Number.isInteger(v.creditAmount) && v.creditAmount >= 1);
      await adminApi.products.setCreditPackVariants(productId, {
        variants: payload,
      });
      setSaved(true);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Créditos por variante
        </Text>

        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        {saved && (
          <Banner tone="success" onDismiss={() => setSaved(false)}>
            Mapeo guardado.
          </Banner>
        )}

        {loading ? (
          <InlineStack align="center" gap="300">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando variantes…
            </Text>
          </InlineStack>
        ) : variants.length === 0 ? (
          <Text as="p" tone="subdued">
            Este producto no tiene variantes en Shopify (o no se pudieron
            cargar).
          </Text>
        ) : (
          <IndexTable
            resourceName={{ singular: "variante", plural: "variantes" }}
            itemCount={variants.length}
            headings={[
              { title: "Variante" },
              { title: "Precio" },
              { title: "Créditos" },
            ]}
            selectable={false}
          >
            {variants.map((v, index) => (
              <IndexTable.Row
                id={v.shopifyVariantId}
                key={v.shopifyVariantId}
                position={index}
              >
                <IndexTable.Cell>
                  {v.shopifyVariantTitle ?? v.shopifyVariantId}
                </IndexTable.Cell>
                <IndexTable.Cell>{v.price ?? "—"}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Box maxWidth="120px">
                    <TextField
                      label=""
                      labelHidden
                      type="number"
                      min={1}
                      autoComplete="off"
                      value={amounts[v.shopifyVariantId] ?? ""}
                      onChange={(value) =>
                        setAmounts((prev) => ({
                          ...prev,
                          [v.shopifyVariantId]: value,
                        }))
                      }
                    />
                  </Box>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        )}

        <InlineStack align="end">
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Guardar créditos
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
