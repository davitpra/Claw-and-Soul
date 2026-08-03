"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  BlockStack,
  Box,
  Icon,
  InlineStack,
  Text,
} from "@shopify/polaris";
import type { IconSource } from "@shopify/polaris";

interface DashboardSectionProps {
  title: string;
  icon: IconSource;
  /**
   * Alcance de las cifras de la sección. Va aquí y no en cada card porque la
   * confusión real del dashboard es «periodo vs. ahora», y se resuelve mejor
   * una vez por bloque que repetida en cada renglón.
   */
  description?: string;
  action?: { label: string; url: string };
  children: ReactNode;
}

/**
 * Cabecera que declara de qué habla el bloque de cards que tiene debajo.
 *
 * El icono es el mismo que el de su celda en `KpiRow` y el de su entrada en
 * `AdminSidebar`: es lo que ata la cifra de arriba con el detalle de abajo y con
 * la sección del admin donde se opera.
 */
export function DashboardSection({
  title,
  icon,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <BlockStack gap="300">
      <InlineStack align="space-between" blockAlign="center" gap="300">
        <InlineStack gap="200" blockAlign="center" wrap={false}>
          <Box background="bg-surface-secondary" borderRadius="200" padding="150">
            <Icon source={icon} />
          </Box>
          <BlockStack gap="0">
            <Text variant="headingMd" as="h2">
              {title}
            </Text>
            {description && (
              <Text variant="bodySm" as="span" tone="subdued">
                {description}
              </Text>
            )}
          </BlockStack>
        </InlineStack>

        {action && (
          // `next/link` y no `<Button url>`: el botón de Polaris renderiza un
          // `<a>` normal y perdería la navegación cliente de Next.
          <Link href={action.url} style={{ textDecoration: "none" }}>
            <Text variant="bodySm" as="span">
              {action.label} →
            </Text>
          </Link>
        )}
      </InlineStack>

      {children}
    </BlockStack>
  );
}
