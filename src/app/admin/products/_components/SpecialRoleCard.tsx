"use client";

import {
  Card,
  Select,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { AdminProduct } from "@/entities/admin/api";
import { SelectedProductTable } from "./SelectedProductTable";

interface SpecialRoleCardProps {
  title: string;
  /** Label del Select, describe para qué se usa el producto asignado. */
  label: string;
  helpText: string;
  /** Lista completa: las opciones se construyen con los productos activos. */
  products: AdminProduct[];
  /** Producto que tiene el rol ahora mismo, o null si está sin asignar. */
  selected: AdminProduct | null;
  imageMap: Record<string, string>;
  saving: boolean;
  onChange: (productId: string) => void;
  onRowClick: (id: string) => void;
}

/**
 * Card para asignar un producto a un rol especial y excluyente (Paint by Numbers
 * o Credit Pack): un Select con los productos activos y, debajo, el producto que
 * tiene el rol. Ambos roles comparten este componente porque solo cambian los
 * textos y el handler.
 */
export function SpecialRoleCard({
  title,
  label,
  helpText,
  products,
  selected,
  imageMap,
  saving,
  onChange,
  onRowClick,
}: SpecialRoleCardProps) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingSm" as="h2">
          {title}
        </Text>
        <InlineStack gap="200" blockAlign="center">
          <div style={{ minWidth: 260 }}>
            <Select
              label={label}
              disabled={saving}
              value={selected?.id ?? ""}
              onChange={onChange}
              helpText={helpText}
              options={[
                { label: "Sin asignar", value: "" },
                ...products
                  .filter((p) => p.isActive)
                  .map((p) => ({ label: p.displayName, value: p.id })),
              ]}
            />
          </div>
          {saving && <Spinner size="small" />}
        </InlineStack>
        {selected && (
          <SelectedProductTable
            product={selected}
            imageMap={imageMap}
            onRowClick={onRowClick}
          />
        )}
      </BlockStack>
    </Card>
  );
}
