"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Card,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  ChoiceList,
  Filters,
  Pagination,
  Box,
} from "@shopify/polaris";
import type {
  AdminUserStatus,
  UserActivityFilter,
} from "@/entities/admin/api";
import {
  USER_ACTIVITY_FILTER_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
  userActivityLabel,
  userStatusLabel,
} from "@/entities/admin/lib/user-status";
import { UsersTable } from "./_components/UsersTable";
import { useUsersList } from "./useUsersList";

/**
 * `useUsersList` lee el filtro inicial de la query string con `useSearchParams`,
 * que obliga a un límite de Suspense aunque la página sea de cliente: sin él el
 * prerender de `next build` falla. El contenido vive en `UsersPageContent` solo
 * por eso.
 */
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersPageFallback />}>
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageFallback() {
  return (
    <Page title="Usuarios" subtitle="Usuarios registrados en la plataforma">
      <Card>
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando usuarios…
            </Text>
          </InlineStack>
        </Box>
      </Card>
    </Page>
  );
}

function UsersPageContent() {
  const router = useRouter();
  const {
    result,
    loading,
    error,
    dismissError,
    search,
    setSearch,
    status,
    setStatus,
    activity,
    setActivity,
    page,
    setPage,
    headings,
    sortProps,
  } = useUsersList();

  const clearAll = () => {
    setSearch("");
    setStatus(null);
    setActivity(null);
  };

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
          <Banner tone="critical" onDismiss={dismissError}>
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
              filters={[
                {
                  key: "status",
                  label: "Estado",
                  filter: (
                    <ChoiceList
                      title="Estado"
                      titleHidden
                      choices={USER_STATUS_FILTER_OPTIONS}
                      selected={status ? [status] : []}
                      onChange={([value]) =>
                        setStatus((value as AdminUserStatus | "all") ?? null)
                      }
                    />
                  ),
                  shortcut: true,
                },
                {
                  key: "activity",
                  label: "Actividad",
                  filter: (
                    <ChoiceList
                      title="Actividad"
                      titleHidden
                      choices={USER_ACTIVITY_FILTER_OPTIONS}
                      selected={activity ? [activity] : []}
                      onChange={([value]) =>
                        setActivity((value as UserActivityFilter) ?? null)
                      }
                    />
                  ),
                  shortcut: true,
                },
              ]}
              appliedFilters={[
                ...(status
                  ? [
                      {
                        key: "status",
                        label:
                          status === "all"
                            ? "Todos los estados"
                            : userStatusLabel(status),
                        onRemove: () => setStatus(null),
                      },
                    ]
                  : []),
                ...(activity
                  ? [
                      {
                        key: "activity",
                        label: userActivityLabel(activity),
                        onRemove: () => setActivity(null),
                      },
                    ]
                  : []),
              ]}
              onQueryChange={setSearch}
              onQueryClear={() => setSearch("")}
              onClearAll={clearAll}
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
            <UsersTable
              users={result?.data ?? []}
              headings={headings}
              sortProps={sortProps}
              onRowClick={(id) => router.push(`/admin/users/${id}`)}
            />
          )}

          {result && result.meta.totalPages > 1 && (
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page < result.meta.totalPages}
                  onPrevious={() => setPage(page - 1)}
                  onNext={() => setPage(page + 1)}
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
