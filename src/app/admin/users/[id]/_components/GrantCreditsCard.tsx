"use client";

import { useState } from "react";
import {
  Card,
  Banner,
  Button,
  Text,
  TextField,
  InlineStack,
  BlockStack,
  Badge,
} from "@shopify/polaris";
import { adminApi } from "@/entities/admin/api";

type GrantCreditsCardProps = {
  userId: string;
  /** Saldo actual del usuario; se refresca en pantalla tras acreditar. */
  balance: number;
  /** Propaga el nuevo saldo al detalle de usuario tras un grant exitoso. */
  onGranted?: (newBalance: number) => void;
};

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1000;

/**
 * Acredita créditos de generación a un usuario vía POST /admin/credits/grant.
 * Autocontenida: valida el monto (1..1000), envía nota opcional y muestra el
 * saldo resultante. Los grants manuales son repetibles (referenceId null).
 */
export function GrantCreditsCard({
  userId,
  balance,
  onGranted,
}: GrantCreditsCardProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const parsed = Number.parseInt(amount, 10);
  const isValid =
    Number.isInteger(parsed) && parsed >= MIN_AMOUNT && parsed <= MAX_AMOUNT;

  const handleGrant = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    setNewBalance(null);
    try {
      const res = await adminApi.users.grantCredits(userId, {
        amount: parsed,
        note: note.trim() || undefined,
      });
      setNewBalance(res.balance);
      setAmount("");
      setNote("");
      onGranted?.(res.balance);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h2">
            Acreditar créditos
          </Text>
          <Badge tone="info">{`${balance} créditos`}</Badge>
        </InlineStack>

        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        {newBalance !== null && (
          <Banner tone="success" onDismiss={() => setNewBalance(null)}>
            Créditos acreditados. Nuevo saldo: {newBalance}.
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

        <InlineStack align="end">
          <Button
            variant="primary"
            loading={saving}
            disabled={!isValid}
            onClick={handleGrant}
          >
            Acreditar créditos
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
