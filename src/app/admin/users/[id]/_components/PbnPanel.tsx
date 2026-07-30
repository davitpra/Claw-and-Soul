"use client";

import { useState } from "react";
import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Link,
  Pagination,
  Spinner,
  Text,
} from "@shopify/polaris";
import { AdminUserPbn } from "@/entities/admin/api";
import { ADMIN_EMPTY_STATE_IMAGE } from "@/entities/admin/lib/empty-state";
import { pbnStatusLabel, pbnStatusTone } from "@/entities/admin/lib/pbn-status";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import { useUserPbn } from "../useUserPbn";

/** Imagen del tile: la foto original hace reconocible la obra de un vistazo. */
function tileImage(pbn: AdminUserPbn): string | null {
  return pbn.sourceImageUrl ?? pbn.previewUrl;
}

/** La del modal es la contraria: ahí interesa ver el resultado del PBN. */
function fullImage(pbn: AdminUserPbn): string | null {
  return pbn.previewUrl ?? pbn.sourceImageUrl;
}

// El `petId` propio del PBN no se rellena al guardar, así que la mascota casi
// siempre llega por la generación de origen. Sin ninguna de las dos (PBN subido
// a mano) el título cae al estilo, y sólo entonces al literal genérico.
function pbnTitle(pbn: AdminUserPbn): string {
  return (
    pbn.pet?.name ||
    pbn.generation?.pet?.name ||
    pbn.generation?.style?.displayName ||
    "Paint by Numbers"
  );
}

/** Pestaña "Paint by Numbers": galería paginada de los PBN guardados. */
export function PbnPanel({ userId }: { userId: string }) {
  const { pbns, loading, page, setPage } = useUserPbn(userId);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(
    null,
  );

  if (loading) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando paint by numbers…
        </Text>
      </InlineStack>
    );
  }

  if (!pbns?.data.length) {
    return (
      <EmptyState
        heading="Sin paint by numbers guardados"
        image={ADMIN_EMPTY_STATE_IMAGE}
      >
        <Text as="p" tone="subdued">
          Este usuario no ha guardado ningún paint by numbers.
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Paint by Numbers ({pbns.meta.total})
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {pbns.data.map((pbn) => (
          <PbnTile key={pbn.id} pbn={pbn} onPreview={setPreview} />
        ))}
      </div>

      {pbns.meta.totalPages > 1 && (
        <InlineStack align="center">
          <Pagination
            hasPrevious={page > 1}
            hasNext={page < pbns.meta.totalPages}
            onPrevious={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
            label={`Página ${pbns.meta.page} de ${pbns.meta.totalPages}`}
          />
        </InlineStack>
      )}

      {preview && (
        <ImagePreviewModal
          src={preview.src}
          title={preview.title}
          onClose={() => setPreview(null)}
        />
      )}
    </BlockStack>
  );
}

function PbnTile({
  pbn,
  onPreview,
}: {
  pbn: AdminUserPbn;
  onPreview: (preview: { src: string; title: string }) => void;
}) {
  const thumb = tileImage(pbn);
  const full = fullImage(pbn);
  const title = pbnTitle(pbn);

  // Artefactos del render: el SVG es el maestro, los otros dos pueden faltar en
  // PBNs antiguos. Se abren en pestaña nueva porque son archivos, no vistas.
  const artifacts = [
    { label: "SVG", url: pbn.outlineSvgUrl },
    { label: "Preview", url: pbn.previewUrl },
    { label: "Paleta", url: pbn.paletteUrl },
  ].filter((a): a is { label: string; url: string } => Boolean(a.url));

  return (
    <Card padding="200">
      <BlockStack gap="200">
        <button
          type="button"
          onClick={() => full && onPreview({ src: full, title })}
          disabled={!full}
          style={{
            all: "unset",
            display: "block",
            aspectRatio: "1",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--p-color-bg-surface-secondary)",
            cursor: full ? "pointer" : "default",
          }}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryThumb(thumb, 300)}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
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
        </button>

        <BlockStack gap="050">
          <Text variant="bodySm" as="span" truncate>
            {title}
          </Text>
          <Text variant="bodySm" tone="subdued" as="span" truncate>
            {pbn.colorCount ? `${pbn.colorCount} colores` : "—"}
          </Text>
          <InlineStack gap="100">
            <Badge tone={pbnStatusTone(pbn.status)} size="small">
              {pbnStatusLabel(pbn.status)}
            </Badge>
            {pbn.origin === "admin" && <Badge size="small">Admin</Badge>}
          </InlineStack>
        </BlockStack>

        {artifacts.length > 0 && (
          <InlineStack gap="200">
            {artifacts.map((a) => (
              <Link key={a.label} url={a.url} target="_blank">
                <Text variant="bodySm" as="span">
                  {a.label}
                </Text>
              </Link>
            ))}
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );
}
