"use client";

import {
  Avatar,
  Badge,
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { AdminUserDetail } from "@/entities/admin/api";
import { fmtAbsoluteDate, getInitials } from "@/entities/admin/lib/user-format";

/**
 * Ficha de identidad del usuario. Los badges de rol y estado no se repiten
 * aquí: ya viven en el `titleMetadata` de la página.
 */
export function UserProfileCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="center">
          <Avatar
            size="xl"
            initials={getInitials(user.fullName, user.email)}
            name={user.fullName ?? user.email}
          />
        </InlineStack>

        <Divider />

        <BlockStack gap="300">
          <Field label="Email" value={user.email} />
          <BlockStack gap="100">
            <Text variant="bodySm" tone="subdued" as="span">
              Email verificado
            </Text>
            <InlineStack>
              <Badge tone={user.emailVerified ? "success" : "critical"}>
                {user.emailVerified ? "Verificado" : "No verificado"}
              </Badge>
            </InlineStack>
          </BlockStack>
          {user.lastLoginAt && (
            <Field
              label="Último acceso"
              value={fmtAbsoluteDate(user.lastLoginAt)}
            />
          )}
          <Field
            label="Miembro desde"
            value={fmtAbsoluteDate(user.createdAt)}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <BlockStack gap="100">
      <Text variant="bodySm" tone="subdued" as="span">
        {label}
      </Text>
      <Text variant="bodyMd" as="span">
        {value}
      </Text>
    </BlockStack>
  );
}
