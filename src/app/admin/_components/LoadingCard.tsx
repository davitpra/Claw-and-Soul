"use client";

import { Card, InlineStack, Spinner, Text } from "@shopify/polaris";

interface LoadingCardProps {
  /** Qué se está cargando, ej. "Cargando estilos…". */
  message: string;
}

/** Placeholder de carga para las listas del admin, en lugar de la tabla. */
export function LoadingCard({ message }: LoadingCardProps) {
  return (
    <Card>
      <InlineStack align="center" gap="300">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          {message}
        </Text>
      </InlineStack>
    </Card>
  );
}
