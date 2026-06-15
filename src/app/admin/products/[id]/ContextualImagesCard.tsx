"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Select,
  Spinner,
  Modal,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  adminApi,
  AdminProductImage,
  ProductImageType,
} from "@/entities/admin/api";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";

const TYPE_OPTIONS: { label: string; value: ProductImageType }[] = [
  { label: "Escena", value: "scene" },
  { label: "En uso", value: "in_use" },
  { label: "Explicativa", value: "explainer" },
  { label: "Galería", value: "gallery" },
  { label: "Gracias", value: "thanks" },
];

const TYPE_LABEL: Record<ProductImageType, string> = {
  scene: "Escena",
  in_use: "En uso",
  explainer: "Explicativa",
  gallery: "Galería",
  thanks: "Gracias",
};

const GENERAL_VALUE = "__general__";
const bucketKey = (variantId: string | null) => variantId ?? GENERAL_VALUE;

type ProductVariant = {
  id: string;
  title: string;
  formatId: string;
  formatName: string;
  shopifyImageUrl?: string | null;
  shopifyImageAlt?: string | null;
};

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
                    renderSection(
                      id,
                      `Variante sin vincular #${i + 1}`,
                      "info",
                    ),
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

function BucketSection({
  title,
  tone,
  variantId,
  shopifyImage,
  images,
  uploading,
  reordering,
  actionId,
  onUpload,
  onDragEnd,
  onView,
  onDelete,
  onPreviewProduct,
}: {
  title: string;
  tone?: "info";
  variantId: string | null;
  shopifyImage?: { url: string; alt: string | null } | null;
  images: AdminProductImage[];
  uploading: boolean;
  reordering: boolean;
  actionId: string | null;
  onUpload: (file: File, type: ProductImageType) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onView: (img: AdminProductImage) => void;
  onDelete: (img: AdminProductImage) => void;
  onPreviewProduct: (src: string) => void;
}) {
  const [uploadType, setUploadType] = useState<ProductImageType>("scene");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    onUpload(file, uploadType);
  };

  return (
    <BlockStack gap="200">
      <InlineStack gap="200" blockAlign="center" align="space-between">
        <InlineStack gap="200" blockAlign="center">
          <Text variant="headingXs" as="h4">
            {title}
          </Text>
          <Badge tone={tone ?? (variantId ? undefined : "info")}>
            {String(images.length)}
          </Badge>
        </InlineStack>
        <div style={{ minWidth: 170 }}>
          <Select
            labelHidden
            label="Tipo para subir"
            options={TYPE_OPTIONS}
            value={uploadType}
            onChange={(v) => setUploadType(v as ProductImageType)}
          />
        </div>
      </InlineStack>

      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              opacity: reordering ? 0.7 : 1,
            }}
          >
            {shopifyImage && (
              <ProductImageTile
                url={shopifyImage.url}
                alt={shopifyImage.alt}
                onClick={() => onPreviewProduct(shopifyImage.url)}
              />
            )}
            {images.map((img) => (
              <SortableImageTile
                key={img.id}
                img={img}
                isPrimary={img.isPrimary}
                isLoading={actionId === img.id}
                onView={() => onView(img)}
                onDelete={() => onDelete(img)}
              />
            ))}
            <UploadTile
              uploading={uploading}
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
    </BlockStack>
  );
}

function ImageViewerModal({
  img,
  saving,
  variantOptions,
  onClose,
  onSave,
}: {
  img: AdminProductImage;
  saving: boolean;
  variantOptions: { label: string; value: string }[];
  onClose: () => void;
  onSave: (body: {
    altImage?: string;
    type?: ProductImageType;
    productFormatVariantId?: string | null;
  }) => void;
}) {
  const [alt, setAlt] = useState(img.altImage ?? "");
  const [type, setType] = useState<ProductImageType>(img.type);
  const [variantValue, setVariantValue] = useState(
    img.productFormatVariantId ?? GENERAL_VALUE,
  );
  const [preview, setPreview] = useState(false);

  const currentVariantValue = img.productFormatVariantId ?? GENERAL_VALUE;
  const dirty =
    alt !== (img.altImage ?? "") ||
    type !== img.type ||
    variantValue !== currentVariantValue;

  return (
    <>
    <Modal
      open
      onClose={onClose}
      title="Imagen contextual"
      size="large"
      primaryAction={{
        content: "Guardar",
        loading: saving,
        disabled: !dirty,
        onAction: () =>
          onSave({
            altImage: alt,
            type,
            productFormatVariantId:
              variantValue === GENERAL_VALUE ? null : variantValue,
          }),
      }}
      secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
    >
      <Modal.Section>
        <InlineStack gap="400" align="start" blockAlign="start" wrap={false}>
          <button
            type="button"
            onClick={() => setPreview(true)}
            aria-label="Ampliar imagen"
            style={{
              padding: 0,
              border: 0,
              background: "none",
              cursor: "zoom-in",
              lineHeight: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.altImage ?? ""}
              style={{
                maxWidth: 360,
                maxHeight: 360,
                objectFit: "contain",
                borderRadius: 8,
                border: "1px solid var(--p-color-border)",
              }}
            />
          </button>
          <div style={{ flex: 1, minWidth: 240 }}>
            <BlockStack gap="300">
              <Select
                label="Variante"
                options={variantOptions}
                value={variantValue}
                onChange={setVariantValue}
              />
              <Select
                label="Tipo"
                options={TYPE_OPTIONS}
                value={type}
                onChange={(v) => setType(v as ProductImageType)}
              />
              <TextField
                label="Texto alternativo (alt)"
                value={alt}
                onChange={setAlt}
                autoComplete="off"
                multiline={2}
              />
            </BlockStack>
          </div>
        </InlineStack>
      </Modal.Section>
    </Modal>
    {preview && (
      <ImagePreviewModal
        src={img.imageUrl}
        title={img.altImage || "Imagen contextual"}
        onClose={() => setPreview(false)}
      />
    )}
    </>
  );
}

function SortableImageTile({
  img,
  isPrimary,
  isLoading,
  onView,
  onDelete,
}: {
  img: AdminProductImage;
  isPrimary: boolean;
  isLoading: boolean;
  onView: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const tileStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    border: isPrimary
      ? "2px solid var(--p-color-border-emphasis)"
      : "1px solid var(--p-color-border)",
    aspectRatio: "1 / 1",
    cursor: "grab",
    background: "var(--p-color-bg-surface)",
  };

  return (
    <div ref={setNodeRef} style={tileStyle} {...attributes} {...listeners}>
      <button
        type="button"
        onClick={onView}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Ver / editar imagen"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.imageUrl}
          alt={img.altImage ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>

      <div style={{ position: "absolute", top: 6, left: 6 }}>
        <Badge tone={isPrimary ? "success" : undefined} size="small">
          {isPrimary ? `★ ${TYPE_LABEL[img.type]}` : TYPE_LABEL[img.type]}
        </Badge>
      </div>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <Spinner size="small" />
        </div>
      )}

      <button
        type="button"
        aria-label="Eliminar imagen"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid var(--p-color-border)",
          borderRadius: 6,
          padding: "4px 6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
        }}
      >
        <DeleteIcon width={16} height={16} />
      </button>
    </div>
  );
}

function ProductImageTile({
  url,
  alt,
  onClick,
}: {
  url: string;
  alt: string | null;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--p-color-border)",
        aspectRatio: "1 / 1",
        background: "var(--p-color-bg-surface)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Ampliar imagen de producto"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "zoom-in",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>
      <div style={{ position: "absolute", top: 6, left: 6 }}>
        <Badge tone="info" size="small">
          Producto
        </Badge>
      </div>
    </div>
  );
}

function UploadTile({
  uploading,
  onClick,
}: {
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      style={{
        aspectRatio: "1 / 1",
        border: "1px dashed var(--p-color-border)",
        borderRadius: 8,
        background: "var(--p-color-bg-surface-secondary)",
        cursor: uploading ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: uploading ? 0.6 : 1,
        flexDirection: "column",
        gap: 4,
      }}
    >
      {uploading ? (
        <Spinner size="small" />
      ) : (
        <PlusIcon width={24} height={24} />
      )}
    </button>
  );
}
