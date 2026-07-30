"use client";

import { ComponentProps } from "react";
import { Box, Card, EmptyState, Text, BlockStack } from "@shopify/polaris";
import { ProductsTable } from "./ProductsTable";

const EMPTY_STATE_IMAGE =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

interface ProductsTableCardProps extends ComponentProps<typeof ProductsTable> {
  title: string;
  /** Aclaración bajo el título: qué entra en esta tabla. */
  helpText?: string;
  /** Para las tablas que solo interesan cuando tienen contenido. */
  hideWhenEmpty?: boolean;
}

/**
 * Card con encabezado + tabla de productos. La página lista varias categorías
 * (Paint by Numbers, Print Art, sin clasificar, accesorios) con la misma
 * estructura, así que el encabezado y el estado vacío viven acá.
 */
export function ProductsTableCard({
  title,
  helpText,
  hideWhenEmpty = false,
  ...tableProps
}: ProductsTableCardProps) {
  const isEmpty = tableProps.products.length === 0;
  if (isEmpty && hideWhenEmpty) return null;

  return (
    <Card padding="0">
      <div style={{ padding: "var(--p-space-400)" }}>
        <BlockStack gap="100">
          <Text variant="headingSm" as="h2">
            {title}
          </Text>
          {helpText && (
            <Text variant="bodySm" tone="subdued" as="p">
              {helpText}
            </Text>
          )}
        </BlockStack>
      </div>

      {isEmpty ? (
        <Box padding="400">
          <EmptyState heading="No hay productos aquí" image={EMPTY_STATE_IMAGE}>
            <p>Sincroniza con Shopify o revisa el contenido de tus productos.</p>
          </EmptyState>
        </Box>
      ) : (
        <ProductsTable {...tableProps} />
      )}
    </Card>
  );
}
