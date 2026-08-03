"use client";

import {
  Badge,
  BlockStack,
  Box,
  Card,
  Divider,
  EmptyState,
  InlineStack,
  Pagination,
  Select,
  Spinner,
  Text,
} from "@shopify/polaris";
import { AdminAuditLogEntry, AdminAuditScope } from "@/entities/admin/api";
import {
  auditActionLabel,
  auditActionTone,
} from "@/entities/admin/lib/audit-actions";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { countryFlag, fmtLocation } from "@/entities/admin/lib/geo-format";
import {
  fmtAbsoluteDate,
  getHandle,
} from "@/entities/admin/lib/user-format";
import { parseUserAgent } from "@/widgets/active-sessions/lib/parse-user-agent";
import { useUserAuditLog } from "../useUserAuditLog";

const SCOPE_OPTIONS: { label: string; value: AdminAuditScope }[] = [
  { label: "Sobre esta cuenta", value: "target" },
  { label: "Hecho por esta cuenta", value: "actor" },
  { label: "Todo", value: "all" },
];

/** Pestaña "Actividad": el rastro de auditoría de la cuenta. */
export function AuditLogPanel({ userId }: { userId: string }) {
  const { entries, loading, page, setPage, scope, setScope } =
    useUserAuditLog(userId);

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingSm" as="h3">
          Historial de la cuenta
          {entries && !loading ? ` (${entries.meta.total})` : ""}
        </Text>
        <Box minWidth="220px">
          <Select
            label="Filtro"
            labelHidden
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={(value) => setScope(value as AdminAuditScope)}
          />
        </Box>
      </InlineStack>

      {loading ? (
        <InlineStack gap="300" blockAlign="center">
          <Spinner size="small" />
          <Text as="span" tone="subdued">
            Cargando historial…
          </Text>
        </InlineStack>
      ) : !entries?.data.length ? (
        <EmptyState heading="Sin actividad registrada" image={ADMIN_EMPTY_STATE_IMAGE}>
          <Text as="p" tone="subdued">
            {scope === "actor"
              ? "Esta cuenta no ha ejecutado acciones sobre otras."
              : "Todavía no ha pasado nada digno de auditar en esta cuenta."}
          </Text>
        </EmptyState>
      ) : (
        <Card>
          <BlockStack gap="300">
            {entries.data.map((entry, i) => (
              <div key={entry.id}>
                {i > 0 && <Divider />}
                <AuditEntry entry={entry} showDirection={scope === "all"} />
              </div>
            ))}
          </BlockStack>

          {entries.meta.totalPages > 1 && (
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page < entries.meta.totalPages}
                  onPrevious={() => setPage(page - 1)}
                  onNext={() => setPage(page + 1)}
                  label={`Página ${entries.meta.page} de ${entries.meta.totalPages}`}
                />
              </InlineStack>
            </Box>
          )}
        </Card>
      )}
    </BlockStack>
  );
}

/** Motivo y transición que `writeAuditLog` guarda en `details`. */
function detailText(details: AdminAuditLogEntry["details"]): string | null {
  if (!details) return null;
  const reason = typeof details.reason === "string" ? details.reason : null;
  const count = typeof details.count === "number" ? details.count : null;

  if (reason) return `Motivo: ${reason}`;
  if (count !== null) return `${count} sesión(es) cerradas`;
  return null;
}

function AuditEntry({
  entry,
  showDirection,
}: {
  entry: AdminAuditLogEntry;
  showDirection: boolean;
}) {
  // Sin actor la acción vino del cron: la baja por inactividad y la purga de
  // los 30 días no las ejecuta nadie.
  const actor = entry.actor
    ? (entry.actor.fullName ?? getHandle(entry.actor.email))
    : "Sistema";
  const detail = detailText(entry.details);
  const device = entry.userAgent ? parseUserAgent(entry.userAgent) : null;
  // La ubicación va delante de la IP: es lo legible, y la IP queda como el
  // dato en crudo que la respalda.
  const place = entry.location
    ? `${countryFlag(entry.location.country)} ${fmtLocation(entry.location)}`
    : null;
  const origin = [place, entry.ipAddress, device].filter(Boolean).join(" · ");

  return (
    <Box paddingBlock="200">
      <InlineStack gap="300" blockAlign="start">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#448da6",
            marginTop: 6,
            flexShrink: 0,
          }}
        />
        <BlockStack gap="100">
          <InlineStack gap="200" blockAlign="center">
            <Badge tone={auditActionTone(entry.action)}>
              {auditActionLabel(entry.action)}
            </Badge>
            {showDirection && entry.direction === "actor" && (
              <Badge>Hecho por esta cuenta</Badge>
            )}
          </InlineStack>
          {detail && (
            <Text variant="bodyMd" as="span">
              {detail}
            </Text>
          )}
          <Text variant="bodySm" tone="subdued" as="span">
            {fmtAbsoluteDate(entry.createdAt)} · {actor}
            {origin ? ` · ${origin}` : ""}
          </Text>
        </BlockStack>
      </InlineStack>
    </Box>
  );
}
