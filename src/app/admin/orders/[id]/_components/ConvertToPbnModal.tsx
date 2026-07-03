"use client";

import { Modal } from "@shopify/polaris";
import { AdminOrderItem } from "@/entities/admin/api";
import AdminPbnStudio from "./pbn/AdminPbnStudio";

// Modal del admin para convertir la imagen generada de un item en una plantilla
// Paint by Numbers y descargarla. Usa una composición propia y editable del admin
// (`AdminPbnStudio`) que reutiliza los hooks del pipeline, seedeada con la imagen
// generada. Todo corre client-side; la salida es solo descarga (no persiste nada
// en el pedido).
export default function ConvertToPbnModal({
  item,
  onClose,
}: {
  item: AdminOrderItem;
  onClose: () => void;
}) {
  // Imagen fuente: la generación por IA del cliente. Si el item no tiene
  // generación, `PbnStudio` cae al ejemplo y el admin puede subir una a mano.
  const source =
    item.generation?.resultUrl ?? item.generation?.thumbnailUrl ?? undefined;

  return (
    <Modal
      open
      onClose={onClose}
      title="Convertir a Paint by Numbers"
      size="fullScreen"
      secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
    >
      <Modal.Section>
        <AdminPbnStudio initialImageSrc={source} />
      </Modal.Section>
    </Modal>
  );
}
