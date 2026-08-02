"use client";

import { useState } from "react";
import {
  Badge,
  BlockStack,
  Card,
  InlineStack,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import { AdminUserGeneration, Paginated } from "@/entities/admin/api";
import {
  generationStatusLabel,
  generationStatusTone,
} from "@/entities/admin/lib/generation-status";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";

interface GenerationsPanelProps {
  gens: Paginated<AdminUserGeneration> | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

/** Pestaña "Resultados IA": galería paginada de generaciones del usuario. */
export function GenerationsPanel({
  gens,
  loading,
  page,
  onPageChange,
}: GenerationsPanelProps) {
  const [preview, setPreview] = useState<AdminUserGeneration | null>(null);
  const previewUrl = preview
    ? (preview.resultUrl ?? preview.thumbnailUrl)
    : null;

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Resultados IA ({gens?.meta.total ?? 0})
      </Text>

      {loading ? (
        <InlineStack gap="300" blockAlign="center">
          <Spinner size="small" />
          <Text as="span" tone="subdued">
            Cargando generaciones…
          </Text>
        </InlineStack>
      ) : !gens?.data.length ? (
        <Text as="p" tone="subdued">
          Este usuario no tiene generaciones.
        </Text>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 12,
          }}
        >
          {gens.data.map((gen) => (
            <GenerationTile
              key={gen.id}
              gen={gen}
              onPreview={() => setPreview(gen)}
            />
          ))}
        </div>
      )}

      {gens && gens.meta.totalPages > 1 && (
        <InlineStack align="center">
          <Pagination
            hasPrevious={page > 1}
            hasNext={page < gens.meta.totalPages}
            onPrevious={() => onPageChange(page - 1)}
            onNext={() => onPageChange(page + 1)}
            label={`Página ${gens.meta.page} de ${gens.meta.totalPages}`}
          />
        </InlineStack>
      )}

      {preview && previewUrl && (
        <ImagePreviewModal
          src={previewUrl}
          title={generationTitle(preview)}
          onClose={() => setPreview(null)}
        />
      )}
    </BlockStack>
  );
}

/** Título del preview: estilo · mascota, con fallback a "Generación". */
function generationTitle(gen: AdminUserGeneration) {
  const parts = [gen.style?.displayName, gen.pet?.name].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Generación";
}

function GenerationTile({
  gen,
  onPreview,
}: {
  gen: AdminUserGeneration;
  onPreview: () => void;
}) {
  const imgUrl = gen.thumbnailUrl ?? gen.resultUrl;

  return (
    <Card padding="200">
      <BlockStack gap="200">
        <div
          style={{
            aspectRatio: "1",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--p-color-bg-surface-secondary)",
          }}
        >
          {imgUrl ? (
            <button
              type="button"
              onClick={onPreview}
              title="Ver detalle"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                padding: 0,
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={gen.style?.displayName ?? "Generación"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </button>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text as="span" tone="subdued">
                —
              </Text>
            </div>
          )}
        </div>

        <BlockStack gap="050">
          <Text variant="bodySm" as="span" truncate>
            {gen.style?.displayName ?? "—"}
          </Text>
          <Text variant="bodySm" tone="subdued" as="span" truncate>
            {gen.pet?.name ?? "—"}
          </Text>
          <InlineStack>
            <Badge tone={generationStatusTone(gen.status)} size="small">
              {generationStatusLabel(gen.status)}
            </Badge>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
