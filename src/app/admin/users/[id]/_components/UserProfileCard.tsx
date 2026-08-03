"use client";

import {
  Avatar,
  Badge,
  BlockStack,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { AdminUserDetail } from "@/entities/admin/api";
import {
  authProviderLabel,
  daysSince,
  fmtAbsoluteDate,
  getHandle,
  getInitials,
} from "@/entities/admin/lib/user-format";

/** Días de alta en texto: «hoy» el primer día, y plural a partir del segundo. */
function antiguedad(createdAt: string): string {
  const days = daysSince(createdAt);
  if (days === 0) return "de alta hoy";
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

/**
 * Ficha de identidad del usuario. Los badges de rol y estado no se repiten
 * aquí: ya viven en el `titleMetadata` de la página.
 */
export function UserProfileCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <BlockStack gap="400">
        {/* El avatar es la foto que subió el propio usuario: cuando falta (o
            falla la carga), Polaris cae solo a las iniciales. */}
        <InlineStack gap="300" blockAlign="center">
          <Avatar
            size="lg"
            source={user.avatarUrl ?? undefined}
            initials={getInitials(user.fullName, user.email)}
            name={user.fullName ?? user.email}
          />
          <BlockStack gap="050">
            <Text variant="headingSm" as="h2">
              {user.fullName || getHandle(user.email)}
            </Text>
            <Text variant="bodySm" tone="subdued" as="span">
              {authProviderLabel(user.authProvider)}
            </Text>
          </BlockStack>
        </InlineStack>

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
          <BlockStack gap="100">
            <Text variant="bodySm" tone="subdued" as="span">
              Créditos
            </Text>
            <InlineStack gap="200" blockAlign="center">
              <Badge tone={user.generationCredits === 0 ? "critical" : "info"}>
                {`${user.generationCredits} ${
                  user.generationCredits === 1 ? "crédito" : "créditos"
                }`}
              </Badge>
              {/* El saldo solo se entiende con lo ya consumido al lado: 0
                  créditos es muy distinto en alguien que gastó 40. */}
              <Text variant="bodySm" tone="subdued" as="span">
                {`${user.creditsSpent} gastado${
                  user.creditsSpent === 1 ? "" : "s"
                }`}
              </Text>
            </InlineStack>
          </BlockStack>
          {user.lastLoginAt && (
            <Field
              label="Último acceso"
              value={fmtAbsoluteDate(user.lastLoginAt)}
            />
          )}
          {/* La antigüedad acompaña a la fecha de alta: el número suelto
            («45 días») no dice desde cuándo, y la fecha sola obliga a
            calcular. */}
          <Field
            label="Miembro desde"
            value={`${fmtAbsoluteDate(user.createdAt)} · ${antiguedad(
              user.createdAt,
            )}`}
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
