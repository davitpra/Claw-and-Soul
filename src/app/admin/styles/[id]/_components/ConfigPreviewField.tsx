import { BlockStack, Text } from "@shopify/polaris";

// Par etiqueta/valor usado en el panel de información del visor de imágenes.
export function ConfigPreviewField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <BlockStack gap="050">
      <Text variant="bodySm" as="span" tone="subdued">
        {label}
      </Text>
      <Text as="p" variant="bodyMd">
        {value}
      </Text>
    </BlockStack>
  );
}
