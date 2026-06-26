"use client";

import { Text, BlockStack, InlineStack, Badge } from "@shopify/polaris";

// Recuadro vacío que se muestra cuando no hay imagen disponible.
function ImagePlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#f6f6f7",
        border: "1px solid #e3e3e3",
        borderRadius: 12,
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

type ItemProductPreviewProps = {
  image: string | null;
  alt: string;
  // Texto pequeño superior (ej. "Imagen para impresión").
  label?: string;
  // Nombre del producto.
  title?: string | null;
  // Variante (ej. "30x40 cm / Marco negro").
  subtitle?: string | null;
  // Tamaño del producto.
  size?: string | null;
  // Marca la imagen como vista previa sin procesar.
  preliminary?: boolean;
  // Si se provee, la imagen es clickeable (cursor zoom-in) y dispara onZoom.
  onZoom?: () => void;
};

// Variante "card de producto" de ItemMediaRow: en lugar de un thumbnail pequeño,
// muestra la imagen grande estilo card de tienda con el nombre del producto,
// la variante y el tamaño debajo.
export function ItemProductPreview({
  image,
  alt,
  label,
  title,
  subtitle,
  size,
  preliminary,
  onZoom,
}: ItemProductPreviewProps) {
  return (
    <BlockStack gap="200" inlineAlign="center">
      {label && (
        <Text variant="bodySm" tone="subdued" as="span">
          {label}
        </Text>
      )}

      <div style={{ width: 220, maxWidth: "100%" }}>
        {image ? (
          onZoom ? (
            <button
              type="button"
              onClick={onZoom}
              title="Ver imagen en grande"
              style={{
                display: "block",
                width: "100%",
                border: "none",
                padding: 0,
                background: "none",
                cursor: "zoom-in",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={alt}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "contain",
                  background: "#ffffff",
                  border: "1px solid #e3e3e3",
                  borderRadius: 12,
                  padding: 12,
                  boxSizing: "border-box",
                }}
              />
            </button>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={alt}
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "contain",
                background: "#ffffff",
                border: "1px solid #e3e3e3",
                borderRadius: 12,
                padding: 12,
                boxSizing: "border-box",
              }}
            />
          )
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <BlockStack gap="050">
        {title && (
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="bodySm" tone="subdued" as="span">
            {subtitle}
          </Text>
        )}
        {size && (
          <Text variant="bodySm" tone="subdued" as="span">
            {size}
          </Text>
        )}
        {preliminary && (
          <InlineStack>
            <Badge tone="attention">Sin procesar</Badge>
          </InlineStack>
        )}
      </BlockStack>
    </BlockStack>
  );
}
