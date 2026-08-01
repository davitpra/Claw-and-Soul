"use client";

import { useState } from "react";
import { Banner, BlockStack, Modal, Text, TextField } from "@shopify/polaris";
import type { UserStatusAction } from "../useUserDetail";

interface UserStatusModalProps {
  action: UserStatusAction | null;
  userName: string;
  saving: boolean;
  error: string | null;
  onDismissError: () => void;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * Copy de cada acción de ciclo de vida. `requiresReason` marca las que cierran
 * la cuenta: el motivo es la única traza de por qué se hizo, y el backend
 * también lo exige.
 */
const COPY: Record<
  UserStatusAction,
  {
    title: string;
    cta: string;
    destructive: boolean;
    requiresReason: boolean;
    warning?: string;
    body: (name: string) => string;
  }
> = {
  ban: {
    title: "¿Suspender esta cuenta?",
    cta: "Suspender",
    destructive: true,
    requiresReason: true,
    warning:
      "Se cerrarán todas sus sesiones. Podrá seguir navegando como máximo 15 minutos más, hasta que caduque su token de acceso.",
    body: (name) =>
      `${name} no podrá iniciar sesión hasta que un admin reactive la cuenta. No se borra ningún dato.`,
  },
  reactivate: {
    title: "¿Reactivar esta cuenta?",
    cta: "Reactivar",
    destructive: false,
    requiresReason: false,
    body: (name) =>
      `${name} volverá a poder iniciar sesión con normalidad. Tendrá que autenticarse de nuevo: las sesiones anteriores no se reabren.`,
  },
  delete: {
    title: "¿Dar de baja esta cuenta?",
    cta: "Dar de baja",
    destructive: true,
    requiresReason: true,
    warning:
      "Dentro de 30 días se borrarán su email, su nombre, su avatar y las fotos de sus mascotas. A partir de ese momento la baja ya no se puede deshacer.",
    body: (name) =>
      `${name} pierde el acceso ahora mismo. Sus pedidos, generaciones y paint-by-numbers se conservan intactos por trazabilidad contable.`,
  },
  restore: {
    title: "¿Restaurar esta cuenta?",
    cta: "Restaurar",
    destructive: false,
    requiresReason: false,
    body: (name) =>
      `Se cancela la baja de ${name} y la cuenta vuelve a estar activa. Solo es posible mientras sus datos no se hayan anonimizado.`,
  },
};

/**
 * Confirmación de suspender / reactivar / dar de baja / restaurar una cuenta.
 * Es presentacional: el estado async lo lleva `useUserDetail`.
 *
 * La página lo monta con `key={action}` para que el motivo escrito no se
 * arrastre de una acción a la siguiente.
 */
export function UserStatusModal({
  action,
  userName,
  saving,
  error,
  onDismissError,
  onClose,
  onConfirm,
}: UserStatusModalProps) {
  const [reason, setReason] = useState("");

  if (!action) return null;

  const copy = COPY[action];
  const missingReason = copy.requiresReason && !reason.trim();

  return (
    <Modal
      open
      onClose={() => {
        if (!saving) onClose();
      }}
      title={copy.title}
      primaryAction={{
        content: copy.cta,
        destructive: copy.destructive,
        loading: saving,
        disabled: missingReason,
        onAction: () => onConfirm(reason.trim()),
      }}
      secondaryActions={[
        { content: "Cancelar", disabled: saving, onAction: onClose },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {error && (
            <Banner tone="critical" onDismiss={onDismissError}>
              {error}
            </Banner>
          )}

          <Text as="p">{copy.body(userName)}</Text>

          {copy.warning && <Banner tone="warning">{copy.warning}</Banner>}

          {copy.requiresReason && (
            <TextField
              label="Motivo"
              value={reason}
              onChange={setReason}
              autoComplete="off"
              multiline={2}
              maxLength={500}
              disabled={saving}
              helpText="Queda registrado en el historial de auditoría."
            />
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
