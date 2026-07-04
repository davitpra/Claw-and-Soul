"use client";

import { useEffect, useState } from "react";
import { Modal, Spinner, InlineStack, Text, Box } from "@shopify/polaris";
import {
  adminApi,
  AdminOrderItem,
  AdminPaintByNumbers,
} from "@/entities/admin/api";
import AdminPbnStudio from "./pbn/AdminPbnStudio";

// Modal del admin para convertir la imagen generada de un item en una plantilla
// Paint by Numbers. Usa una composición propia y editable del admin
// (`AdminPbnStudio`) que reutiliza los hooks del pipeline, seedeada con la imagen
// generada. Corre client-side; puede descargarse o **guardarse en el pedido**
// (persiste el PBN y lo enlaza al OrderItem vía `onSaved`).
//
// Si el item ya tiene un PBN guardado, traemos su config + imagen fuente y
// precargamos el estudio (mismos ajustes, misma imagen, auto-procesado).
export default function ConvertToPbnModal({
  item,
  orderId,
  onClose,
  onSaved,
}: {
  item: AdminOrderItem;
  orderId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const savedPbnId = item.paintByNumbers?.id ?? null;
  const [savedPbn, setSavedPbn] = useState<AdminPaintByNumbers | null>(null);
  // Solo cargamos si hay un PBN guardado que traer.
  const [loading, setLoading] = useState<boolean>(!!savedPbnId);

  useEffect(() => {
    if (!savedPbnId) return;
    let active = true;
    adminApi.pbn
      .get(savedPbnId)
      .then((pbn) => {
        if (active) setSavedPbn(pbn);
      })
      .catch(() => {
        // Si falla la carga, abrimos el estudio en limpio (fallback).
        if (active) setSavedPbn(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [savedPbnId]);

  // Imagen fuente por defecto: la generación por IA del cliente. Si el item no
  // tiene generación, `AdminPbnStudio` cae al ejemplo y el admin sube una a mano.
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
        {loading ? (
          <Box padding="600">
            <InlineStack align="center" gap="300">
              <Spinner size="small" />
              <Text as="span" tone="subdued">
                Cargando el PBN guardado…
              </Text>
            </InlineStack>
          </Box>
        ) : (
          <AdminPbnStudio
            initialImageSrc={source}
            orderId={orderId}
            itemId={item.id}
            onSaved={onSaved}
            savedPbn={
              savedPbn
                ? {
                    config: savedPbn.config,
                    sourceImageUrl: savedPbn.sourceImageUrl,
                    outlineSvgUrl: savedPbn.outlineSvgUrl,
                  }
                : undefined
            }
          />
        )}
      </Modal.Section>
    </Modal>
  );
}
