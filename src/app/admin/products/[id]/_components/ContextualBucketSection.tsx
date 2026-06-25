import { useRef, useState } from "react";
import { Text, BlockStack, InlineStack, Badge, Select } from "@shopify/polaris";
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
} from "@dnd-kit/sortable";
import type {
  AdminProductImage,
  ProductImageType,
} from "@/entities/admin/api";
import { TYPE_OPTIONS } from "./contextualImages";
import {
  SortableImageTile,
  ProductImageTile,
  UploadTile,
} from "./ContextualImageTiles";

// Sección de un "bucket" de imágenes (una variante o el respaldo General):
// selector de tipo + grid ordenable + celda de subida.
export function BucketSection({
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
