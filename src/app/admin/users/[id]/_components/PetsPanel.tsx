"use client";

import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { AdminUserPet } from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { PhotoGrid } from "./PhotoGrid";

/** Pestaña "Mascotas": una card por mascota con sus fotos. */
export function PetsPanel({ pets }: { pets: AdminUserPet[] }) {
  if (pets.length === 0) {
    return (
      <EmptyState
        heading="Sin mascotas registradas"
        image={ADMIN_EMPTY_STATE_IMAGE}
      >
        <Text as="p" tone="subdued">
          Este usuario no tiene mascotas.
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Mascotas ({pets.length})
      </Text>
      {pets.map((pet) => (
        <Card key={pet.id}>
          <BlockStack gap="300">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingSm" as="h3">
                {pet.name}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {pet.species}
                {pet.breed ? ` · ${pet.breed}` : ""}
              </Text>
              {!pet.isActive && <Badge tone="enabled">Inactiva</Badge>}
            </InlineStack>

            {pet.photos.length === 0 ? (
              <Text as="p" tone="subdued" variant="bodySm">
                Sin fotos subidas.
              </Text>
            ) : (
              <PhotoGrid
                photos={pet.photos.map((photo) => ({
                  ...photo,
                  alt: pet.name,
                }))}
              />
            )}
          </BlockStack>
        </Card>
      ))}
    </BlockStack>
  );
}
