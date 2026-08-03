"use client";

import { BlockStack, Modal, Text } from "@shopify/polaris";

interface RevokeSessionsModalProps {
  open: boolean;
  userName: string;
  sessionCount: number;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmación del cierre masivo de sesiones. Presentacional puro: el estado
 * async lo lleva `useUserSessions`, igual que `UserStatusModal` con
 * `useUserDetail`.
 */
export function RevokeSessionsModal({
  open,
  userName,
  sessionCount,
  saving,
  onClose,
  onConfirm,
}: RevokeSessionsModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      title="Cerrar todas las sesiones"
      primaryAction={{
        content: "Cerrar sesiones",
        destructive: true,
        loading: saving,
        onAction: onConfirm,
      }}
      secondaryActions={[
        { content: "Cancelar", disabled: saving, onAction: onClose },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p">
            Se cerrarán las {sessionCount} sesiones abiertas de {userName}. La
            próxima vez que use la app tendrá que volver a iniciar sesión.
          </Text>
          {/* El access token ya emitido sigue siendo válido hasta que caduca:
              conviene decirlo para que nadie lo lea como un corte inmediato. */}
          <Text as="p" tone="subdued" variant="bodySm">
            La cuenta no se suspende. El acceso ya concedido puede tardar hasta
            15 minutos en cortarse del todo.
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
