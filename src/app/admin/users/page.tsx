"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page,
  Card,
  IndexTable,
  Avatar,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Filters,
  Pagination,
  Box,
  Button,
} from "@shopify/polaris";
import { adminApi, AdminUserListItem, Paginated } from "@/entities/admin/api";
import { ServerSortColumn, useServerSort } from "@/hooks/useTableSort";

// "Ubicación" no es ordenable: hoy se rellena con LOCATION_PLACEHOLDERS, no con
// datos del backend, así que ordenar por esa columna no significaría nada.
const COLUMNS: ServerSortColumn[] = [
  { title: "Usuario", sortKey: "name" },
  { title: "Correo", sortKey: "email" },
  { title: "Ubicación" },
  { title: "Mascotas", sortKey: "pets", defaultSortDirection: "descending" },
  {
    title: "Generaciones",
    sortKey: "generations",
    defaultSortDirection: "descending",
  },
  {
    title: "Última actividad",
    sortKey: "lastActivity",
    defaultSortDirection: "descending",
  },
  { title: "" },
];

const LOCATION_PLACEHOLDERS = [
  "Buenos Aires, AR",
  "Córdoba, AR",
  "Rosario, AR",
  "La Plata, AR",
  "Mendoza, AR",
  "Mar del Plata, AR",
  "Santiago, CL",
  "Montevideo, UY",
];

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getHandle(email: string): string {
  return "@" + email.split("@")[0];
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminUsersPage() {
  const [result, setResult] = useState<Paginated<AdminUserListItem> | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { sortKey, sortOrder, headings, sortProps } = useServerSort(COLUMNS, {
    onSortChange: () => setPage(1),
  });

  // `loading` derivado: hay carga en curso mientras la query ya resuelta no
  // coincida con la actual. Evita el setState síncrono dentro del efecto. El
  // orden entra en la clave porque también cambia la respuesta del backend.
  const queryKey = `${page}|${search}|${sortKey}|${sortOrder}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .list({
        page,
        search: search || undefined,
        sort: sortKey,
        order: sortOrder,
      })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setLoadedKey(queryKey);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, sortKey, sortOrder, queryKey]);

  return (
    <Page
      title="Usuarios"
      subtitle="Usuarios registrados en la plataforma"
      titleMetadata={
        result ? (
          <Badge tone="success">{`${result.meta.total} en total`}</Badge>
        ) : undefined
      }
    >
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <Card padding="0">
          <Box
            paddingInline="400"
            paddingBlock="300"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <Filters
              queryValue={search}
              filters={[]}
              onQueryChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              onQueryClear={() => {
                setSearch("");
                setPage(1);
              }}
              onClearAll={() => {
                setSearch("");
                setPage(1);
              }}
              queryPlaceholder="Buscar usuario…"
            />
          </Box>

          {loading ? (
            <Box padding="600">
              <InlineStack align="center" gap="300">
                <Spinner size="small" />
                <Text as="span" tone="subdued">
                  Cargando usuarios…
                </Text>
              </InlineStack>
            </Box>
          ) : (
            <IndexTable
              resourceName={{ singular: "usuario", plural: "usuarios" }}
              itemCount={result?.data.length ?? 0}
              headings={headings}
              {...sortProps}
              selectable={false}
            >
              {result?.data.map((u, i) => (
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
                    <Text as="span" tone="subdued">
                      {LOCATION_PLACEHOLDERS[i % LOCATION_PLACEHOLDERS.length]}
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
                    <Text as="span" tone="subdued">
                      {relativeTime(u.lastLoginAt)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Link href={`/admin/users/${u.id}`}>
                      <Button variant="plain" size="slim">
                        Ver
                      </Button>
                    </Link>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          )}

          {result && result.meta.totalPages > 1 && (
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page < result.meta.totalPages}
                  onPrevious={() => setPage((p) => p - 1)}
                  onNext={() => setPage((p) => p + 1)}
                  label={`Página ${page} de ${result.meta.totalPages}`}
                />
              </InlineStack>
            </Box>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
