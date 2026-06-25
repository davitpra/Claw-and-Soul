import { useState } from "react";
import {
  Modal,
  BlockStack,
  InlineStack,
  Select,
  TextField,
} from "@shopify/polaris";
import type {
  AdminProductImage,
  ProductImageType,
} from "@/entities/admin/api";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import { TYPE_OPTIONS, GENERAL_VALUE } from "./contextualImages";

// Visor/editor de una imagen contextual: reasignar variante, tipo y alt.
export function ImageViewerModal({
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
