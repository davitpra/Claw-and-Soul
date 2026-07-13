"use client";

import {
  IndexTable,
  Badge,
  Thumbnail,
  Text,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { AdminProduct } from "@/entities/admin/api";

interface SelectedProductTableProps {
  product: AdminProduct;
  imageMap: Record<string, string>;
  onRowClick: (id: string) => void;
}

/**
 * Tabla compacta que muestra el producto asignado a un rol especial
 * (Paint by Numbers o Credit Pack) dentro de su card. El producto que se
 * muestra aquí se excluye de la tabla principal de productos.
 */
export function SelectedProductTable({
  product,
  imageMap,
  onRowClick,
}: SelectedProductTableProps) {
  return (
    <IndexTable
      resourceName={{ singular: "producto", plural: "productos" }}
      itemCount={1}
      headings={[{ title: "Producto" }, { title: "Estado" }]}
      selectable={false}
    >
      <IndexTable.Row
        id={product.id}
        key={product.id}
        position={0}
        tone={product.isActive ? undefined : "subdued"}
        onClick={() => onRowClick(product.id)}
      >
        <IndexTable.Cell>
          <InlineStack gap="300" blockAlign="center">
            <Thumbnail
              source={
                (product.shopifyHandle && imageMap[product.shopifyHandle]) ||
                ImageIcon
              }
              alt={product.displayName}
              size="small"
            />
            <BlockStack gap="0">
              <Text variant="bodyMd" fontWeight="semibold" as="span">
                {product.displayName}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {product.name}
              </Text>
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={product.isActive ? "success" : "enabled"}>
            {product.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </IndexTable.Cell>
      </IndexTable.Row>
    </IndexTable>
  );
}
