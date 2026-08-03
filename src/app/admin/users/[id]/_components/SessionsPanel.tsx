"use client";

import { useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  IndexTable,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import { AdminUserSession } from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { countryFlag, fmtLocation } from "@/entities/admin/lib/geo-format";
import {
  fmtAbsoluteDate,
  fmtRelativeTime,
} from "@/entities/admin/lib/user-format";
import { parseUserAgent } from "@/widgets/active-sessions/lib/parse-user-agent";
import { useUserSessions } from "../useUserSessions";
import { RevokeSessionsModal } from "./RevokeSessionsModal";

interface SessionsPanelProps {
  userId: string;
  userName: string;
  /** Con la cuenta cerrada el vacío tiene explicación, y hay que darla. */
  accountActive: boolean;
}

/**
 * Pestaña "Sesiones": los refresh tokens vivos del usuario, con revocación
 * individual y masiva.
 */
export function SessionsPanel({
  userId,
  userName,
  accountActive,
}: SessionsPanelProps) {
  const {
    sessions,
    loading,
    revoking,
    error,
    dismissError,
    revokeOne,
    revokeAll,
  } = useUserSessions(userId);
  const [confirmingAll, setConfirmingAll] = useState(false);

  if (loading) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando sesiones…
        </Text>
      </InlineStack>
    );
  }

  if (!sessions?.length) {
    return (
      <EmptyState heading="Sin sesiones abiertas" image={ADMIN_EMPTY_STATE_IMAGE}>
        <Text as="p" tone="subdued">
          {accountActive
            ? "Este usuario no tiene ninguna sesión iniciada."
            : "La cuenta no está activa: sus sesiones se revocaron al cerrarla."}
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="050">
          <Text variant="headingSm" as="h3">
            Sesiones abiertas ({sessions.length})
          </Text>
          {/* Sin esta línea la columna se lee como un dato duro, y no lo es. */}
          <Text variant="bodySm" tone="subdued" as="span">
            La ubicación se estima por IP: una VPN o una conexión móvil la
            desplazan.
          </Text>
        </BlockStack>
        <Button
          tone="critical"
          variant="secondary"
          loading={revoking === "all"}
          disabled={Boolean(revoking)}
          onClick={() => setConfirmingAll(true)}
        >
          Cerrar todas
        </Button>
      </InlineStack>

      {error && (
        <Banner tone="critical" onDismiss={dismissError}>
          {error}
        </Banner>
      )}

      <Card padding="0">
        <IndexTable
          resourceName={{ singular: "sesión", plural: "sesiones" }}
          itemCount={sessions.length}
          headings={[
            { title: "Dispositivo" },
            { title: "Ubicación" },
            { title: "IP" },
            { title: "Último uso" },
            { title: "Expira" },
            { title: "" },
          ]}
          selectable={false}
        >
          {sessions.map((session, i) => (
            <SessionRow
              key={session.id}
              session={session}
              position={i}
              revoking={revoking}
              onRevoke={revokeOne}
            />
          ))}
        </IndexTable>
      </Card>

      <RevokeSessionsModal
        open={confirmingAll}
        userName={userName}
        sessionCount={sessions.length}
        saving={revoking === "all"}
        onClose={() => setConfirmingAll(false)}
        onConfirm={async () => {
          await revokeAll();
          setConfirmingAll(false);
        }}
      />
    </BlockStack>
  );
}

function SessionRow({
  session,
  position,
  revoking,
  onRevoke,
}: {
  session: AdminUserSession;
  position: number;
  revoking: string | null;
  onRevoke: (tokenId: string) => void;
}) {
  // `parseUserAgent` cae en "Unknown device" y el resto del admin está en
  // español: el vacío se resuelve aquí en vez de tocar el helper compartido.
  const device = session.userAgent
    ? parseUserAgent(session.userAgent)
    : "Dispositivo desconocido";

  return (
    <IndexTable.Row id={session.id} position={position}>
      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" fontWeight="medium">
            {device}
          </Text>
          {session.isCurrent && <Badge tone="info">Esta sesión</Badge>}
        </InlineStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {session.location
            ? `${countryFlag(session.location.country)} ${fmtLocation(session.location)}`
            : "—"}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {session.ipAddress ?? "—"}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {fmtRelativeTime(session.lastUsedAt)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {fmtAbsoluteDate(session.expiresAt)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Box minWidth="90px">
          {/* La propia sesión del admin no se ofrece para revocar: cerrarla
              desde aquí sería echarse a uno mismo del panel. */}
          {session.isCurrent ? (
            <Text as="span" tone="subdued" variant="bodySm">
              —
            </Text>
          ) : (
            <Button
              variant="plain"
              tone="critical"
              loading={revoking === session.id}
              disabled={Boolean(revoking)}
              onClick={() => onRevoke(session.id)}
            >
              Revocar
            </Button>
          )}
        </Box>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}
