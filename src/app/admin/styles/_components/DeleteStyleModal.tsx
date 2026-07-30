"use client";

import { Banner, BlockStack, Checkbox, Modal, Text } from "@shopify/polaris";

interface DeleteStyleModalProps {
  open: boolean;
  deleting: boolean;
  styleName: string;
  /** Generaciones asociadas al estilo; si hay, el borrado pide confirmación extra. */
  generationCount: number;
  forceConfirm: boolean;
  onForceConfirmChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteStyleModal({
  open,
  deleting,
  styleName,
  generationCount,
  forceConfirm,
  onForceConfirmChange,
  onClose,
  onConfirm,
}: DeleteStyleModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="¿Eliminar estilo permanentemente?"
      primaryAction={{
        content: "Eliminar",
        destructive: true,
        loading: deleting,
        disabled: generationCount > 0 && !forceConfirm,
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
              {styleName}
            </Text>{" "}
            de forma permanente.
          </Text>
          <Text as="p" tone="subdued">
            Las imágenes del estilo se borrarán también del almacenamiento. Las
            referencias de producto perderán el vínculo con este estilo. Esta
            acción no se puede deshacer.
          </Text>
          {generationCount > 0 && (
            <Banner tone="warning">
              <BlockStack gap="200">
                <Text as="p">
                  Este estilo tiene{" "}
                  <Text as="span" fontWeight="semibold">
                    {generationCount} generación(es)
                  </Text>{" "}
                  asociada(s). Si continúas, también se borrarán de forma
                  permanente (incluyendo sus archivos en el almacenamiento).
                </Text>
                <Checkbox
                  label={`Sí, borrar también las ${generationCount} generación(es) asociada(s)`}
                  checked={forceConfirm}
                  onChange={onForceConfirmChange}
                />
              </BlockStack>
            </Banner>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
