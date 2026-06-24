"use client";

import { useState } from "react";
import {
  Banner,
  BlockStack,
  TextField,
  Modal,
  Checkbox,
} from "@shopify/polaris";
import { adminApi, AdminOrderDetail } from "@/entities/admin/api";

type CancelOrderModalProps = {
  order: AdminOrderDetail;
  itemIds: string[];
  onClose: () => void;
  onDone: (warnings: string[]) => void;
};

export function CancelOrderModal({
  order,
  itemIds,
  onClose,
  onDone,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(true);
  const [restock, setRestock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const targets = order.items.filter((i) => itemIds.includes(i.id));
  const podSubmitted = targets.filter(
    (i) => i.fulfillmentMethod === "pod" && i.podOrderId,
  );
  const remainingActive = order.items.filter(
    (i) =>
      !itemIds.includes(i.id) &&
      !["cancelled", "refunded"].includes(i.productionStatus),
  );
  const wholeOrder = remainingActive.length === 0;

  async function handleConfirm() {
    setSubmitting(true);
    setErr(null);
    try {
      const res = await adminApi.orders.cancel(order.id, {
        itemIds,
        reason: reason.trim() || undefined,
        refund,
        restock,
      });
      onDone(res.warnings);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={
        wholeOrder
          ? "Cancelar pedido"
          : `Cancelar ${targets.length} item${targets.length > 1 ? "s" : ""}`
      }
      primaryAction={{
        content: "Confirmar cancelación",
        destructive: true,
        loading: submitting,
        onAction: handleConfirm,
      }}
      secondaryActions={[
        { content: "Volver", onAction: onClose, disabled: submitting },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}
          {wholeOrder ? (
            <Banner tone="warning">
              Se cancelará el <strong>pedido completo</strong> en Shopify
              {refund ? " y se reembolsará al cliente" : ""}.
            </Banner>
          ) : (
            <Banner tone="info">
              Se hará un <strong>reembolso parcial</strong> en Shopify de los
              items seleccionados. El resto del pedido sigue activo.
            </Banner>
          )}
          {podSubmitted.length > 0 && (
            <Banner tone="warning">
              {podSubmitted.length} item
              {podSubmitted.length > 1 ? "s ya enviados" : " ya enviado"} a
              Pictorem. La app no puede cancelarlo automáticamente — deberás
              contactar a soporte de Pictorem manualmente.
            </Banner>
          )}
          <TextField
            label="Motivo (opcional)"
            value={reason}
            onChange={setReason}
            autoComplete="off"
            multiline={2}
          />
          <Checkbox
            label="Reembolsar al cliente en Shopify"
            checked={refund}
            onChange={setRefund}
            disabled={!wholeOrder}
            helpText={
              !wholeOrder
                ? "El reembolso parcial siempre devuelve el importe de las líneas seleccionadas."
                : undefined
            }
          />
          <Checkbox
            label="Reponer inventario (restock)"
            checked={restock}
            onChange={setRestock}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
