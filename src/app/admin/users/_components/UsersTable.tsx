"use client";

import type { IndexTableProps } from "@shopify/polaris";
import {
  Avatar,
  Badge,
  BlockStack,
  Box,
  Button,
  EmptyState,
  IndexTable,
  InlineStack,
  Text,
  Tooltip,
} from "@shopify/polaris";
import {
  PersonIcon,
  PlusCircleIcon,
  ReceiptDollarIcon,
} from "@shopify/polaris-icons";
import { AdminUserListItem } from "@/entities/admin/api";
import {
  fmtAbsoluteDate,
  fmtRelativeTime,
  getHandle,
  getInitials,
  roleBadgeTone,
} from "@/entities/admin/lib/user-format";
import type { SortProps } from "@/hooks/useTableSort";

type UsersTableProps = {
  users: AdminUserListItem[];
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
  onRowClick: (id: string) => void;
  /** Abre el modal para acreditar créditos al usuario de la fila. */
  onGrantCredits: (user: AdminUserListItem) => void;
};

/** Contador de la fila: un 0 se muestra como hueco para que destaque lo que sí tiene actividad. */
function CountCell({ value }: { value: number }) {
  return (
    <Text as="span" alignment="end" numeric tone={value ? undefined : "subdued"}>
      {value || "—"}
    </Text>
  );
}

/** Filas de la lista de usuarios. El orden lo decide el backend vía `sortProps`. */
export function UsersTable({
  users,
  headings,
  sortProps,
  onRowClick,
  onGrantCredits,
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
          tone={u.isActive ? undefined : "subdued"}
          onClick={() => onRowClick(u.id)}
        >
          <IndexTable.Cell>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Avatar
                size="sm"
                initials={getInitials(u.fullName, u.email)}
                name={u.fullName ?? u.email}
              />
              <BlockStack gap="0">
                {/* Los badges solo aparecen cuando dicen algo: un usuario normal
                    y activo es el caso mayoritario y no necesita etiqueta. */}
                <InlineStack gap="150" blockAlign="center">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {u.fullName || getHandle(u.email)}
                  </Text>
                  {u.role !== "user" && (
                    <Badge tone={roleBadgeTone(u.role)} size="small">
                      {u.role}
                    </Badge>
                  )}
                  {!u.isActive && (
                    <Badge tone="critical" size="small">
                      Inactivo
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
            {/* Las acciones no deben disparar el onClick de la fila. */}
            <div onClick={(e) => e.stopPropagation()}>
              <InlineStack gap="100" align="end" blockAlign="center">
                <Tooltip content="Ver ficha">
                  <Button
                    url={`/admin/users/${u.id}`}
                    variant="tertiary"
                    size="slim"
                    icon={PersonIcon}
                    accessibilityLabel={`Ver ficha de ${u.fullName || u.email}`}
                  />
                </Tooltip>
                <Tooltip content="Movimientos de créditos">
                  <Button
                    url={`/admin/credits/${u.id}`}
                    variant="tertiary"
                    size="slim"
                    icon={ReceiptDollarIcon}
                    accessibilityLabel={`Movimientos de créditos de ${u.fullName || u.email}`}
                  />
                </Tooltip>
                <Tooltip content="Acreditar créditos">
                  <Button
                    variant="tertiary"
                    size="slim"
                    icon={PlusCircleIcon}
                    accessibilityLabel={`Acreditar créditos a ${u.fullName || u.email}`}
                    onClick={() => onGrantCredits(u)}
                  />
                </Tooltip>
              </InlineStack>
            </div>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
