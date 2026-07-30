"use client";

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
  Filters,
  Pagination,
  Box,
} from "@shopify/polaris";
import { UsersTable } from "./_components/UsersTable";
import { useUsersList } from "./useUsersList";

export default function AdminUsersPage() {
  const router = useRouter();
  const {
    result,
    loading,
    error,
    dismissError,
    search,
    setSearch,
    page,
    setPage,
    headings,
    sortProps,
  } = useUsersList();

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
              filters={[]}
              onQueryChange={setSearch}
              onQueryClear={() => setSearch("")}
              onClearAll={() => setSearch("")}
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
