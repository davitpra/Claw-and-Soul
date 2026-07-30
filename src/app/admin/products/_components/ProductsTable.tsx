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
import {
  normalizeTemplate,
  templateLabel,
} from "@/entities/product/lib/template";
import { SortColumn, useTableSort } from "@/hooks/useTableSort";

// El template es el formato de entrega del storefront: Digital es la descarga
// del coloreable; Canvas/Poster son los físicos. El contenido (coloreable vs
// arte terminado) es el otro eje, artKind; no tiene columna propia porque la
// página ya reparte los productos en una tabla por artKind.
export const TEMPLATE_OPTIONS = [
  { label: "Por defecto", value: "" },
  { label: "Digital (descarga)", value: "Digital" },
  { label: "Canvas", value: "Canvas" },
  { label: "Poster", value: "Poster" },
  { label: "Credits", value: "Credits" },
  { label: "Accessory", value: "Accessory" },
];

/**
 * Formato de los accesorios. Su fuente de verdad es el metafield `custom.art_kind`
 * de Shopify, que el sync baja a `isAccessory`; este valor sigue existiendo como
 * template para los productos legacy marcados a mano o vía `productType`.
 */
export const ACCESSORY_TEMPLATE = "Accessory";

/** Valores de template que el Select acepta (sin la opción vacía "Por defecto"). */
const VALID_TEMPLATES = new Set(
  TEMPLATE_OPTIONS.map((o) => o.value).filter(Boolean),
);

/**
 * Template efectivo de un producto: si Shopify lo marcó como accesorio (metafield
 * `custom.art_kind`, que el sync baja a `isAccessory`) manda eso; si no, el
 * template guardado; si no, el `productType` de Shopify (solo si es una opción
 * válida); si no, "". normalizeTemplate absorbe el valor legacy "PBN" (alias de
 * "Digital"). Compartido entre la partición de la página y el default del Select.
 */
export function resolveTemplate(
  p: Pick<AdminProduct, "template" | "shopifyHandle" | "isAccessory">,
  productTypeMap: Record<string, string>,
): string {
  if (p.isAccessory) return ACCESSORY_TEMPLATE;
  if (p.template) return normalizeTemplate(p.template);
  const shopifyType = normalizeTemplate(
    p.shopifyHandle ? productTypeMap[p.shopifyHandle] : undefined,
  );
  return VALID_TEMPLATES.has(shopifyType) ? shopifyType : "";
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
  // Se ordena por el valor que muestra la celda (el label del template, el del
  // contenido, el nombre del estilo), no por el campo crudo, para que lo que se
  // ve sea lo que se ordena. El hook vive dentro de la tabla, así que las dos
  // instancias (productos y accesorios) llevan su orden por separado.
  const columns: SortColumn<AdminProduct>[] = [
    { title: "Producto", sortBy: (p) => p.displayName },
    ...(showStyleColumn
      ? [
          {
            title: "Estilo asignado",
            sortBy: (p: AdminProduct) => p.style?.displayName,
          },
        ]
      : []),
    { title: "Fulfillment", sortBy: (p) => p.fulfillmentMethod ?? "in_house" },
    { title: "Template", sortBy: (p) => resolveTemplate(p, productTypeMap) },
    {
      title: "Estado",
      sortBy: (p) => p.isActive,
      defaultSortDirection: "descending",
    },
    { title: "Acciones" },
  ];

  const { rows, headings, sortProps } = useTableSort(products, columns);

  return (
    <IndexTable
      resourceName={{ singular: "producto", plural: "productos" }}
      itemCount={rows.length}
      headings={headings}
      {...sortProps}
      selectable={false}
    >
      {rows.map((p, index) => (
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
            {/* Los accesorios los declara el metafield custom.art_kind de
                Shopify, así que su formato es de solo lectura: dejarlo editable
                invitaría a un cambio que el siguiente sync revierte. */}
            {p.isAccessory ? (
              <BlockStack gap="0">
                <Text variant="bodyMd" as="span">
                  {templateLabel(ACCESSORY_TEMPLATE)}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  Se edita en Shopify
                </Text>
              </BlockStack>
            ) : (
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
            )}
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
