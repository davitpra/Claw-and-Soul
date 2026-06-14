"use client";

import { Modal, BlockStack, Text } from "@shopify/polaris";

type DeleteProductModalProps = {
  open: boolean;
  deleting: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProductModal({
  open,
  deleting,
  productName,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!deleting) onClose();
      }}
      title="¿Eliminar producto permanentemente?"
      primaryAction={{
        content: "Eliminar",
        destructive: true,
        loading: deleting,
        onAction: onConfirm,
      }}
      secondaryActions={[
        {
          content: "Cancelar",
          disabled: deleting,
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="200">
          <Text as="p">
            Se eliminará{" "}
            <Text as="span" fontWeight="semibold">
              {productName}
            </Text>{" "}
            y todas sus variantes vinculadas.
          </Text>
          <Text as="p" tone="subdued">
            Las generaciones y pedidos existentes se conservan sin referencia al
            producto. Esta acción no se puede deshacer.
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
