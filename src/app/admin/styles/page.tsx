"use client";

import { Page, Card, Banner, BlockStack } from "@shopify/polaris";
import { LoadingCard } from "@/app/admin/_components/LoadingCard";
import { DeleteStyleModal } from "./_components/DeleteStyleModal";
import { StylesTable } from "./_components/StylesTable";
import { useStylesList } from "./useStylesList";

export default function AdminStylesPage() {
  const {
    styles,
    generationCount,
    loading,
    error,
    toggling,
    deletingTarget,
    deleting,
    forceConfirm,
    setError,
    setDeletingTarget,
    setForceConfirm,
    closeDeleteModal,
    handleToggle,
    handleDelete,
  } = useStylesList();

  return (
    <Page title="Estilos" subtitle="Catálogo de estilos de IA disponibles">
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {loading ? (
          <LoadingCard message="Cargando estilos…" />
        ) : (
          <Card padding="0">
            <StylesTable
              styles={styles}
              toggling={toggling}
              onToggle={handleToggle}
              onDelete={setDeletingTarget}
            />
          </Card>
        )}
      </BlockStack>

      <DeleteStyleModal
        open={deletingTarget !== null}
        deleting={deleting}
        styleName={deletingTarget?.displayName ?? ""}
        generationCount={generationCount}
        forceConfirm={forceConfirm}
        onForceConfirmChange={setForceConfirm}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </Page>
  );
}
