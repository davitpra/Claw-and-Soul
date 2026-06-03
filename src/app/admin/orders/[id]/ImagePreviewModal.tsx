"use client";

import { useState } from "react";
import { Modal, BlockStack, InlineStack, Text } from "@shopify/polaris";

export default function ImagePreviewModal({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="large"
      secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300" inlineAlign="center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            onLoad={(e) =>
              setDims({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: 8,
              objectFit: "contain",
            }}
          />
          <InlineStack gap="300" blockAlign="center">
            <Text as="span" tone="subdued" variant="bodySm">
              {dims
                ? `Resolución: ${dims.w} × ${dims.h} px`
                : "Cargando resolución…"}
            </Text>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#448da6", fontSize: 13 }}
            >
              Abrir original →
            </a>
          </InlineStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
