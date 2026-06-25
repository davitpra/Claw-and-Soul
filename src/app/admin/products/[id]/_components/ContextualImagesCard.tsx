"use client";

import { useEffect, useState } from "react";
import { Card, Text, BlockStack, Box, Spinner, Modal } from "@shopify/polaris";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  adminApi,
  AdminProductImage,
  ProductImageType,
} from "@/entities/admin/api";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import {
  GENERAL_VALUE,
  bucketKey,
  type ProductVariant,
} from "./contextualImages";
import { BucketSection } from "./ContextualBucketSection";
import { ImageViewerModal } from "./ContextualImageViewerModal";

export function ContextualImagesCard({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [reorderingKey, setReorderingKey] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [viewing, setViewing] = useState<AdminProductImage | null>(null);
  const [deleting, setDeleting] = useState<AdminProductImage | null>(null);
  const [productPreview, setProductPreview] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const load = async () => {
    try {
      const rows = await adminApi.products.listImages(productId);
      setImages(rows);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const imagesFor = (variantId: string | null) =>
    images.filter((img) => (img.productFormatVariantId ?? null) === variantId);

  const handleUpload = async (
    variantId: string | null,
    type: ProductImageType,
    file: File,
  ) => {
    setUploadingKey(bucketKey(variantId));
    setError(null);
    try {
      await adminApi.products.uploadImage(productId, file, {
        type,
        productFormatVariantId: variantId,
        orderIndex: imagesFor(variantId).length,
      });
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDragEnd = async (
    variantId: string | null,
    event: DragEndEvent,
  ) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const bucket = imagesFor(variantId);
    const oldIndex = bucket.findIndex((img) => img.id === active.id);
    const newIndex = bucket.findIndex((img) => img.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(bucket, oldIndex, newIndex).map((img, i) => ({
      ...img,
      orderIndex: i,
      isPrimary: i === 0,
    }));

    // Optimistic: replace this bucket's images in the full list.
    const others = images.filter(
      (img) => (img.productFormatVariantId ?? null) !== variantId,
    );
    setImages([...others, ...reordered]);
    setReorderingKey(bucketKey(variantId));
    try {
      const newPrimary = reordered[0];
      const prevPrimary = bucket[0];

      if (newPrimary?.id && newPrimary.id !== prevPrimary?.id) {
        await adminApi.products.updateImage(productId, newPrimary.id, {
          isPrimary: true,
          orderIndex: 0,
        });
      }

      await Promise.all(
        reordered
          .filter((img, i) => {
            if (img.id === newPrimary?.id) return false;
            const prev = bucket.find((p) => p.id === img.id);
            return !!prev && prev.orderIndex !== i;
          })
          .map((img) =>
            adminApi.products.updateImage(productId, img.id, {
              orderIndex: img.orderIndex,
            }),
          ),
      );
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
      await load();
    } finally {
      setReorderingKey(null);
    }
  };

  const handleUpdate = async (
    img: AdminProductImage,
    body: {
      altImage?: string;
      type?: ProductImageType;
      productFormatVariantId?: string | null;
    },
  ) => {
    setActionId(img.id);
    setError(null);
    try {
      await adminApi.products.updateImage(productId, img.id, body);
      await load();
      setViewing((prev) =>
        prev && prev.id === img.id ? { ...prev, ...body } : prev,
      );
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setActionId(deleting.id);
    try {
      await adminApi.products.deleteImage(productId, deleting.id);
      setDeleting(null);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  };

  // Group linked variants by format (size) for the section headings.
  const variantById = new Map(variants.map((v) => [v.id, v]));
  const formatGroups: {
    formatId: string;
    formatName: string;
    variants: ProductVariant[];
  }[] = [];
  for (const v of variants) {
    let group = formatGroups.find((g) => g.formatId === v.formatId);
    if (!group) {
      group = { formatId: v.formatId, formatName: v.formatName, variants: [] };
      formatGroups.push(group);
    }
    group.variants.push(v);
  }

  // Images pointing at a variant that is no longer linked → "sin vincular".
  const orphanVariantIds = Array.from(
    new Set(
      images
        .map((img) => img.productFormatVariantId)
        .filter((id): id is string => !!id && !variantById.has(id)),
    ),
  );

  // Modal reassignment options: General + every linked variant.
  const variantSelectOptions = [
    { label: "General (todas las variantes)", value: GENERAL_VALUE },
    ...variants.map((v) => ({
      label: `${v.formatName} — ${v.title}`,
      value: v.id,
    })),
  ];

  const renderSection = (
    variantId: string | null,
    title: string,
    tone?: "info",
  ) => {
    const variant = variantId ? variantById.get(variantId) : null;
    const shopifyImage = variant?.shopifyImageUrl
      ? { url: variant.shopifyImageUrl, alt: variant.shopifyImageAlt ?? null }
      : null;
    return (
      <BucketSection
        key={bucketKey(variantId)}
        title={title}
        tone={tone}
        variantId={variantId}
        shopifyImage={shopifyImage}
        images={imagesFor(variantId)}
        uploading={uploadingKey === bucketKey(variantId)}
        reordering={reorderingKey === bucketKey(variantId)}
        actionId={actionId}
        onUpload={(file, type) => handleUpload(variantId, type, file)}
        onDragEnd={(event) => handleDragEnd(variantId, event)}
        onView={setViewing}
        onDelete={setDeleting}
        onPreviewProduct={(src) => setProductPreview({ src, title })}
      />
    );
  };

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="headingSm" as="h2">
            Imágenes contextuales
          </Text>
        </BlockStack>

        {error && (
          <Text as="p" tone="critical">
            {error}
          </Text>
        )}

        {loading ? (
          <Spinner size="small" />
        ) : (
          <BlockStack gap="500">
            {variants.length === 0 && (
              <Text as="p" tone="subdued">
                Este producto aún no tiene variantes vinculadas. Vincula
                variantes para gestionar imágenes por variante, o usa “General”.
              </Text>
            )}

            {formatGroups.map((group) => (
              <BlockStack key={group.formatId} gap="300">
                <Box
                  borderColor="border"
                  borderBlockEndWidth="025"
                  paddingBlockEnd="100"
                >
                  <Text variant="headingSm" as="h3">
                    {group.formatName}
                  </Text>
                </Box>
                <BlockStack gap="400">
                  {group.variants.map((v) => renderSection(v.id, v.title))}
                </BlockStack>
              </BlockStack>
            ))}

            {orphanVariantIds.length > 0 && (
              <BlockStack gap="300">
                <Box
                  borderColor="border"
                  borderBlockEndWidth="025"
                  paddingBlockEnd="100"
                >
                  <Text variant="headingSm" as="h3" tone="subdued">
                    Variantes sin vincular
                  </Text>
                </Box>
                <BlockStack gap="400">
                  {orphanVariantIds.map((id, i) =>
                    renderSection(id, `Variante sin vincular #${i + 1}`, "info"),
                  )}
                </BlockStack>
              </BlockStack>
            )}

            {renderSection(null, "General (respaldo)")}
          </BlockStack>
        )}
      </BlockStack>

      {viewing && (
        <ImageViewerModal
          img={viewing}
          saving={actionId === viewing.id}
          variantOptions={variantSelectOptions}
          onClose={() => setViewing(null)}
          onSave={(body) => handleUpdate(viewing, body)}
        />
      )}

      {productPreview && (
        <ImagePreviewModal
          src={productPreview.src}
          title={productPreview.title}
          onClose={() => setProductPreview(null)}
        />
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Eliminar imagen"
        primaryAction={{
          content: "Eliminar",
          destructive: true,
          loading: !!deleting && actionId === deleting.id,
          onAction: handleDelete,
        }}
        secondaryActions={[
          { content: "Cancelar", onAction: () => setDeleting(null) },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            ¿Eliminar esta imagen contextual? Esta acción no se puede deshacer.
          </Text>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
