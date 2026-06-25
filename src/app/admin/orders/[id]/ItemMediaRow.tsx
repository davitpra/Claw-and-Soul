"use client";

import { ReactNode } from "react";
import { Text, InlineStack, BlockStack, Thumbnail } from "@shopify/polaris";

// Recuadro vacío que se muestra cuando no hay imagen disponible.
function ThumbnailPlaceholder() {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        background: "#f6f6f7",
        border: "1px solid #e3e3e3",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text as="span" tone="subdued" variant="bodySm">
        —
      </Text>
    </div>
  );
}

type ItemMediaRowProps = {
  image: string | null;
  alt: string;
  // Si se provee, el thumbnail es clickeable (cursor zoom-in) y dispara onZoom.
  onZoom?: () => void;
  children: ReactNode;
};

// Fila reutilizable "thumbnail + contenido" usada para la imagen de producto,
// la imagen generada y la imagen de impresión del item.
export function ItemMediaRow({ image, alt, onZoom, children }: ItemMediaRowProps) {
  return (
    <InlineStack gap="400" blockAlign="start">
      <div style={{ flexShrink: 0 }}>
        <BlockStack gap="100" inlineAlign="center">
          {image ? (
            onZoom ? (
              <button
                type="button"
                onClick={onZoom}
                title="Ver imagen en grande"
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "zoom-in",
                }}
              >
                <Thumbnail source={image} alt={alt} size="medium" />
              </button>
            ) : (
              <Thumbnail source={image} alt={alt} size="medium" />
            )
          ) : (
            <ThumbnailPlaceholder />
          )}
        </BlockStack>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </InlineStack>
  );
}
