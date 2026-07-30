"use client";

import { BlockStack, EmptyState, Text } from "@shopify/polaris";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { UserPhoto } from "../useUserDetail";
import { PhotoGrid } from "./PhotoGrid";

/** Pestaña "Imágenes": todas las fotos del usuario sin agrupar por mascota. */
export function PhotosPanel({ photos }: { photos: UserPhoto[] }) {
  if (photos.length === 0) {
    return (
      <EmptyState heading="Sin imágenes" image={ADMIN_EMPTY_STATE_IMAGE}>
        <Text as="p" tone="subdued">
          Este usuario no ha subido fotos.
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="300">
      <Text variant="headingMd" as="h2">
        Imágenes subidas ({photos.length})
      </Text>
      <PhotoGrid
        photos={photos.map((photo) => ({ ...photo, alt: photo.petName }))}
      />
    </BlockStack>
  );
}
