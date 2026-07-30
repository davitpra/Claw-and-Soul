"use client";

import {
  BlockStack,
  Box,
  Button,
  EmptyState,
  IndexTable,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { DeleteIcon, ImageIcon } from "@shopify/polaris-icons";
import { AdminStyle } from "@/entities/admin/api";
import { SortColumn, useTableSort } from "@/hooks/useTableSort";
import { ActiveToggleBadge } from "@/app/admin/_components/ActiveToggleBadge";

const COLUMNS: SortColumn<AdminStyle>[] = [
  { title: "Vista previa" },
  { title: "Nombre", sortBy: (s) => s.displayName },
  { title: "Categoría", sortBy: (s) => s.category },
  {
    title: "Imágenes",
    sortBy: (s) => s.images.length,
    defaultSortDirection: "descending",
  },
  {
    title: "Estado",
    sortBy: (s) => s.isActive,
    defaultSortDirection: "descending",
  },
  { title: "Acciones" },
];

interface StylesTableProps {
  styles: AdminStyle[];
  /** Id del estilo cuyo toggle está en vuelo. */
  toggling: string | null;
  onRowClick: (id: string) => void;
  onToggle: (style: AdminStyle) => void;
  onDelete: (style: AdminStyle) => void;
}

export function StylesTable({
  styles,
  toggling,
  onRowClick,
  onToggle,
  onDelete,
}: StylesTableProps) {
  const { rows, headings, sortProps } = useTableSort(styles, COLUMNS);

  return (
    <IndexTable
      resourceName={{ singular: "estilo", plural: "estilos" }}
      itemCount={rows.length}
      headings={headings}
      {...sortProps}
      selectable={false}
      emptyState={
        <Box padding="400">
          <EmptyState
            heading="No hay estilos todavía"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <Text as="p" tone="subdued">
              Crea un estilo para que aparezca en el catálogo de IA.
            </Text>
          </EmptyState>
        </Box>
      }
    >
      {rows.map((s, index) => (
        <IndexTable.Row
          id={s.id}
          key={s.id}
          position={index}
          tone={s.isActive ? undefined : "subdued"}
          onClick={() => onRowClick(s.id)}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={s.previewUrl ?? ImageIcon}
              alt={s.displayName}
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <BlockStack gap="0">
              <Text variant="bodyMd" fontWeight="semibold" as="span">
                {s.displayName}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {s.name}
              </Text>
            </BlockStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" tone="subdued">
              {s.category}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{s.images.length}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <div onClick={(e) => e.stopPropagation()}>
              <ActiveToggleBadge
                isActive={s.isActive}
                loading={toggling === s.id}
                onToggle={() => onToggle(s)}
                resourceLabel="estilo"
              />
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
                  accessibilityLabel={`Eliminar ${s.displayName}`}
                  onClick={() => onDelete(s)}
                />
              </InlineStack>
            </div>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
