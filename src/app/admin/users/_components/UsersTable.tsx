"use client";

import Link from "next/link";
import type { IndexTableProps } from "@shopify/polaris";
import {
  Avatar,
  Badge,
  BlockStack,
  Button,
  IndexTable,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { AdminUserListItem } from "@/entities/admin/api";
import {
  fmtRelativeTime,
  getHandle,
  getInitials,
} from "@/entities/admin/lib/user-format";
import type { SortProps } from "@/hooks/useTableSort";

type UsersTableProps = {
  users: AdminUserListItem[];
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
  /** Abre el modal para acreditar créditos al usuario de la fila. */
  onGrantCredits: (user: AdminUserListItem) => void;
};

/** Filas de la lista de usuarios. El orden lo decide el backend vía `sortProps`. */
export function UsersTable({
  users,
  headings,
  sortProps,
  onGrantCredits,
}: UsersTableProps) {
  return (
    <IndexTable
      resourceName={{ singular: "usuario", plural: "usuarios" }}
      itemCount={users.length}
      headings={headings}
      {...sortProps}
      selectable={false}
    >
      {users.map((u, i) => (
        <IndexTable.Row id={u.id} key={u.id} position={i}>
          <IndexTable.Cell>
            <InlineStack gap="300" blockAlign="center">
              <Avatar
                size="sm"
                initials={getInitials(u.fullName, u.email)}
                name={u.fullName ?? u.email}
              />
              <BlockStack gap="0">
                <Text variant="bodyMd" fontWeight="semibold" as="span">
                  {u.fullName || getHandle(u.email)}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  {getHandle(u.email)}
                </Text>
              </BlockStack>
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" tone="subdued">
              {u.email}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" fontWeight="medium">
              {u._count.pets}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" fontWeight="medium">
              {u._count.generations}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone="info">{`${u.generationCredits} créditos`}</Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" tone="subdued">
              {fmtRelativeTime(u.lastLoginAt)}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack gap="300" blockAlign="center">
              <Link href={`/admin/users/${u.id}`}>
                <Button variant="plain" size="slim">
                  Ver
                </Button>
              </Link>
              <Link href={`/admin/credits/${u.id}`}>
                <Button variant="plain" size="slim">
                  Movimientos
                </Button>
              </Link>
              <Button
                variant="plain"
                size="slim"
                onClick={() => onGrantCredits(u)}
              >
                Acreditar
              </Button>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
