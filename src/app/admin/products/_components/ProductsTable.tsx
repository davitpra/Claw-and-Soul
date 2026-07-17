"use client";

import {
  IndexTable,
  Badge,
  Button,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Select,
  Thumbnail,
} from "@shopify/polaris";
import { DeleteIcon, ImageIcon } from "@shopify/polaris-icons";
import { AdminProduct, AdminStyle } from "@/entities/admin/api";

export const TEMPLATE_OPTIONS = [
  { label: "Por defecto", value: "" },
  { label: "Canvas", value: "Canvas" },
  { label: "Poster", value: "Poster" },
  { label: "Credits", value: "Credits" },
  { label: "Accessory", value: "Accessory" },
  { label: "PBN", value: "PBN" },
];

/** Un producto es accesorio cuando su template es "Accessory". */
export const ACCESSORY_TEMPLATE = "Accessory";

/** Valores de template que el Select acepta (sin la opción vacía "Por defecto"). */
const VALID_TEMPLATES = new Set(
  TEMPLATE_OPTIONS.map((o) => o.value).filter(Boolean),
);

/**
 * Template efectivo de un producto: el guardado manda; si no hay, cae al
 * `productType` de Shopify (solo si es una opción válida); si no, "".
 * Compartido entre la partición de la página y el default del Select.
 */
export function resolveTemplate(
  p: Pick<AdminProduct, "template" | "shopifyHandle">,
  productTypeMap: Record<string, string>,
): string {
  if (p.template) return p.template;
  const shopifyType = p.shopifyHandle
    ? productTypeMap[p.shopifyHandle]
    : undefined;
  return shopifyType && VALID_TEMPLATES.has(shopifyType) ? shopifyType : "";
}

interface ProductsTableProps {
  products: AdminProduct[];
  styles: AdminStyle[];
  imageMap: Record<string, string>;
  /** Mapa handle → productType de Shopify, usado como default del template. */
  productTypeMap: Record<string, string>;
  /** La tabla de accesorios no asigna estilo, así que oculta esa columna. */
  showStyleColumn?: boolean;
  savingStyle: string | null;
  savingFulfillment: string | null;
  savingTemplate: string | null;
  toggling: string | null;
  onRowClick: (id: string) => void;
  onStyleChange: (productId: string, styleId: string) => void;
  onFulfillmentChange: (productId: string, value: string) => void;
  onTemplateChange: (productId: string, value: string) => void;
  onToggleActive: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

/**
 * Tabla de productos compartida por la card de productos (con estilo asignado)
 * y la de accesorios. Ambas comparten columnas salvo "Estilo asignado".
 */
export function ProductsTable({
  products,
  styles,
  imageMap,
  productTypeMap,
  showStyleColumn = false,
  savingStyle,
  savingFulfillment,
  savingTemplate,
  toggling,
  onRowClick,
  onStyleChange,
  onFulfillmentChange,
  onTemplateChange,
  onToggleActive,
  onDelete,
}: ProductsTableProps) {
  return (
    <IndexTable
      resourceName={{ singular: "producto", plural: "productos" }}
      itemCount={products.length}
      headings={[
        { title: "Producto" },
        ...(showStyleColumn ? [{ title: "Estilo asignado" }] : []),
        { title: "Fulfillment" },
        { title: "Template" },
        { title: "Estado" },
        { title: "Acciones" },
      ]}
      selectable={false}
    >
      {products.map((p, index) => (
        <IndexTable.Row
          id={p.id}
          key={p.id}
          position={index}
          tone={p.isActive ? undefined : "subdued"}
          onClick={() => onRowClick(p.id)}
        >
          <IndexTable.Cell>
            <InlineStack gap="300" blockAlign="center">
              <Thumbnail
                source={
                  (p.shopifyHandle && imageMap[p.shopifyHandle]) || ImageIcon
                }
                alt={p.displayName}
                size="small"
              />
              <BlockStack gap="0">
                <Text variant="bodyMd" fontWeight="semibold" as="span">
                  {p.displayName}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  {p.name}
                </Text>
              </BlockStack>
            </InlineStack>
          </IndexTable.Cell>

          {showStyleColumn && (
            <IndexTable.Cell>
              <div onClick={(e) => e.stopPropagation()}>
                <InlineStack gap="200" blockAlign="center">
                  <div style={{ minWidth: 180 }}>
                    <Select
                      label=""
                      labelHidden
                      disabled={savingStyle === p.id}
                      value={p.styleId ?? ""}
                      onChange={(value) => onStyleChange(p.id, value)}
                      options={[
                        { label: "Sin asignar", value: "" },
                        ...styles.map((s) => ({
                          label: s.displayName,
                          value: s.id,
                        })),
                      ]}
                    />
                  </div>
                  {savingStyle === p.id && <Spinner size="small" />}
                </InlineStack>
              </div>
            </IndexTable.Cell>
          )}

          <IndexTable.Cell>
            <div onClick={(e) => e.stopPropagation()}>
              <InlineStack gap="200" blockAlign="center">
                <div style={{ minWidth: 170 }}>
                  <Select
                    label=""
                    labelHidden
                    disabled={savingFulfillment === p.id}
                    value={p.fulfillmentMethod ?? "in_house"}
                    onChange={(value) => onFulfillmentChange(p.id, value)}
                    options={[
                      { label: "Taller (in-house)", value: "in_house" },
                      { label: "POD (externo)", value: "pod" },
                    ]}
                  />
                </div>
                {savingFulfillment === p.id && <Spinner size="small" />}
              </InlineStack>
            </div>
          </IndexTable.Cell>

          <IndexTable.Cell>
            <div onClick={(e) => e.stopPropagation()}>
              <InlineStack gap="200" blockAlign="center">
                <div style={{ minWidth: 150 }}>
                  <Select
                    label=""
                    labelHidden
                    disabled={savingTemplate === p.id}
                    value={resolveTemplate(p, productTypeMap)}
                    onChange={(value) => onTemplateChange(p.id, value)}
                    helpText={
                      // El valor mostrado viene del productType de Shopify, no de
                      // un template guardado: avisamos que es heredado.
                      !p.template && resolveTemplate(p, productTypeMap)
                        ? "Heredado de Shopify"
                        : undefined
                    }
                    options={TEMPLATE_OPTIONS}
                  />
                </div>
                {savingTemplate === p.id && <Spinner size="small" />}
              </InlineStack>
            </div>
          </IndexTable.Cell>

          <IndexTable.Cell>
            <div onClick={(e) => e.stopPropagation()}>
              <InlineStack gap="200" blockAlign="center">
                <button
                  type="button"
                  onClick={() => onToggleActive(p)}
                  disabled={toggling === p.id}
                  aria-label={
                    p.isActive ? "Desactivar producto" : "Activar producto"
                  }
                  title={
                    p.isActive ? "Click para desactivar" : "Click para activar"
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: toggling === p.id ? "wait" : "pointer",
                    opacity: toggling === p.id ? 0.6 : 1,
                  }}
                >
                  <Badge tone={p.isActive ? "success" : "enabled"}>
                    {p.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </button>
                {toggling === p.id && <Spinner size="small" />}
              </InlineStack>
            </div>
          </IndexTable.Cell>

          <IndexTable.Cell>
            <div onClick={(e) => e.stopPropagation()}>
              <InlineStack gap="200" blockAlign="center">
                <Button
                  variant="plain"
                  tone="critical"
                  size="slim"
                  icon={DeleteIcon}
                  accessibilityLabel={`Eliminar ${p.displayName}`}
                  onClick={() => onDelete(p)}
                />
              </InlineStack>
            </div>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
