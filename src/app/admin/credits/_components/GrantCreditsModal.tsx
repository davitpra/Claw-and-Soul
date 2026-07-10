"use client";

import { useState } from "react";
import {
  Modal,
  Banner,
  Text,
  TextField,
  BlockStack,
} from "@shopify/polaris";
import { adminApi, AdminUserListItem } from "@/entities/admin/api";

type GrantCreditsModalProps = {
  /** Usuario destino; el modal está abierto cuando no es null. */
  user: AdminUserListItem | null;
  onClose: () => void;
  /** Propaga el nuevo saldo a la fila del listado tras un grant exitoso. */
  onGranted: (newBalance: number) => void;
};

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1000;

/**
 * Acredita créditos a un usuario desde la lista de /admin/credits vía
 * POST /admin/credits/grant. Valida el monto (1..1000) y admite nota opcional.
 * Los grants manuales son repetibles (referenceId null).
 */
export function GrantCreditsModal({
  user,
  onClose,
  onGranted,
}: GrantCreditsModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Number.parseInt(amount, 10);
  const isValid =
    Number.isInteger(parsed) && parsed >= MIN_AMOUNT && parsed <= MAX_AMOUNT;

  const reset = () => {
    setAmount("");
    setNote("");
    setError(null);
    setSaving(false);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleGrant = async () => {
    if (!user || !isValid) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.users.grantCredits(user.id, {
        amount: parsed,
        note: note.trim() || undefined,
      });
      onGranted(res.balance);
      reset();
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!user}
      onClose={handleClose}
      title={user ? `Acreditar créditos a ${user.email}` : "Acreditar créditos"}
      primaryAction={{
        content: "Acreditar",
        onAction: handleGrant,
        loading: saving,
        disabled: !isValid,
      }}
      secondaryActions={[{ content: "Cancelar", onAction: handleClose, disabled: saving }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {user && (
            <Text as="p" tone="subdued">
              Saldo actual: {user.generationCredits} créditos.
            </Text>
          )}

          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          <TextField
            label="Cantidad"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            value={amount}
            onChange={setAmount}
            autoComplete="off"
            helpText="Entre 1 y 1000 créditos."
          />

          <TextField
            label="Nota (opcional)"
            value={note}
            onChange={setNote}
            autoComplete="off"
            multiline={2}
            placeholder="Motivo del abono, p. ej. compensación por incidencia"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
