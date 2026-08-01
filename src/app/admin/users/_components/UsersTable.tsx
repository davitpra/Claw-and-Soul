"use client";

import type { IndexTableProps } from "@shopify/polaris";
import {
  Badge,
  BlockStack,
  Box,
  EmptyState,
  IndexTable,
  InlineStack,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { AdminUserListItem } from "@/entities/admin/api";
import {
  fmtAbsoluteDate,
  fmtRelativeTime,
  getHandle,
  roleBadgeTone,
} from "@/entities/admin/lib/user-format";
import {
  userStatusLabel,
  userStatusTone,
} from "@/entities/admin/lib/user-status";
import type { SortProps } from "@/hooks/useTableSort";

type UsersTableProps = {
  users: AdminUserListItem[];
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
  onRowClick: (id: string) => void;
};

/** Contador de la fila: un 0 se muestra como hueco para que destaque lo que sí tiene actividad. */
function CountCell({ value }: { value: number }) {
  return (
    <Text
      as="span"
      alignment="end"
      numeric
      tone={value ? undefined : "subdued"}
    >
      {value || "—"}
    </Text>
  );
}

/**
 * Filas de la lista de usuarios. El orden lo decide el backend vía `sortProps`.
 * Sin acciones por fila: todo lo que se puede hacer con un usuario (incluido
 * acreditar créditos y ver sus movimientos) vive en su ficha, a un clic.
 */
export function UsersTable({
  users,
  headings,
  sortProps,
  onRowClick,
}: UsersTableProps) {
  return (
    <IndexTable
      resourceName={{ singular: "usuario", plural: "usuarios" }}
      itemCount={users.length}
      headings={headings}
      {...sortProps}
      selectable={false}
      emptyState={
        <Box padding="400">
          <EmptyState
            heading="No se encontraron usuarios"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <Text as="p" tone="subdued">
              Prueba con otro término de búsqueda.
            </Text>
          </EmptyState>
        </Box>
      }
    >
      {users.map((u, i) => (
        <IndexTable.Row
          id={u.id}
          key={u.id}
          position={i}
          tone={u.status === "active" ? undefined : "subdued"}
          onClick={() => onRowClick(u.id)}
        >
          <IndexTable.Cell>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <BlockStack gap="0">
                {/* El badge de rol solo aparece cuando dice algo: un usuario
                    normal es el caso mayoritario y no necesita etiqueta. El
                    estado tiene su propia columna. */}
                <InlineStack gap="150" blockAlign="center">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {u.fullName || getHandle(u.email)}
                  </Text>
                  {u.role !== "user" && (
                    <Badge tone={roleBadgeTone(u.role)} size="small">
                      {u.role}
                    </Badge>
                  )}
                </InlineStack>
                <Text variant="bodySm" tone="subdued" as="span">
                  {u.email}
                </Text>
              </BlockStack>
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <CountCell value={u._count.pets} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <CountCell value={u._count.generations} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <CountCell value={u._count.paintByNumbers} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <CountCell value={u._count.orders} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            {/* Saldo agotado en crítico: es justo a quien hay que acreditar. */}
            <InlineStack align="end">
              <Badge tone={u.generationCredits === 0 ? "critical" : "info"}>
                {`${u.generationCredits} créditos`}
              </Badge>
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {u.lastLoginAt ? (
              <Tooltip content={fmtAbsoluteDate(u.lastLoginAt)}>
                <Text as="span" tone="subdued">
                  {fmtRelativeTime(u.lastLoginAt)}
                </Text>
              </Tooltip>
            ) : (
              <Text as="span" tone="subdued">
                —
              </Text>
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {u.statusReason ? (
              <Tooltip content={u.statusReason}>
                <Badge tone={userStatusTone(u.status)}>
                  {userStatusLabel(u.status)}
                </Badge>
              </Tooltip>
            ) : (
              <Badge tone={userStatusTone(u.status)}>
                {userStatusLabel(u.status)}
              </Badge>
            )}
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
