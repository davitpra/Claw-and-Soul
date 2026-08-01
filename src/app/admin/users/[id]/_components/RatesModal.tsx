"use client";

import { BlockStack, Modal, Text } from "@shopify/polaris";
import {
  RATES_DESCRIPTION,
  RatesEditor,
} from "@/app/admin/_components/RatesEditor";

interface RatesModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Mismo editor de tarifas que la página de Gastos, en modal: se corrigen desde
 * el detalle del usuario sin perder de vista sus gastos. Polaris solo monta el
 * contenido mientras está abierto, así que las tarifas se releen en cada
 * apertura y no hace falta refrescarlas a mano.
 */
export function RatesModal({ open, onClose }: RatesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tarifas fal.ai"
      size="large"
      secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p" tone="subdued" variant="bodySm">
            {RATES_DESCRIPTION}
          </Text>
          <RatesEditor />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
