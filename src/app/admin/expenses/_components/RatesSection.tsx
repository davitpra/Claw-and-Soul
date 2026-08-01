"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Collapsible,
  Divider,
  InlineStack,
  Select,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";
import { adminApi, ProviderRate } from "@/entities/admin/api";
import {
  RATE_UNIT_LABELS,
  RATE_UNIT_OPTIONS,
} from "@/entities/admin/lib/provider-rate";

type Msg = { text: string; tone: "success" | "critical" };
/** Edición en curso de una fila: monto como texto (lo que hay en el input). */
type RateDraft = { amount: string; unit: string };

/**
 * Tarifas de proveedor: alta manual y edición de monto y unidad. La unidad
 * importa porque solo `per_megapixel` hace que el upscale cobre por superficie;
 * un modelo auto-registrado nace como `per_image` y hay que corregirlo aquí.
 */
export function RatesSection() {
  const [rates, setRates] = useState<ProviderRate[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RateDraft>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<Record<string, Msg>>({});

  useEffect(() => {
    let alive = true;
    adminApi.expenseRates.list().then((data) => {
      if (alive) {
        setRates(data);
        setDrafts(Object.fromEntries(data.map((r) => [r.id, toDraft(r)])));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  function clearMsg(key: string) {
    setMsg((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSave(rate: ProviderRate) {
    const draft = drafts[rate.id];
    const amount = parseFloat(draft?.amount ?? "");
    if (isNaN(amount) || amount < 0) {
      setMsg((prev) => ({
        ...prev,
        [rate.id]: { text: "Monto inválido.", tone: "critical" },
      }));
      return;
    }
    setSaving((prev) => ({ ...prev, [rate.id]: true }));
    clearMsg(rate.id);
    try {
      const updated = await adminApi.expenseRates.update(rate.id, {
        amount,
        unit: draft.unit,
      });
      setRates((prev) =>
        (prev ?? []).map((r) => (r.id === rate.id ? updated : r)),
      );
      setDrafts((prev) => ({ ...prev, [rate.id]: toDraft(updated) }));
      setMsg((prev) => ({
        ...prev,
        [rate.id]: { text: "Guardado.", tone: "success" },
      }));
    } catch (e) {
      setMsg((prev) => ({
        ...prev,
        [rate.id]: { text: (e as Error).message, tone: "critical" },
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [rate.id]: false }));
    }
  }

  function handleCreated(rate: ProviderRate) {
    setRates((prev) => [...(prev ?? []), rate]);
    setDrafts((prev) => ({ ...prev, [rate.id]: toDraft(rate) }));
  }

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text variant="headingSm" as="h2">
            Tarifas fal.ai
          </Text>
          <Text as="p" tone="subdued" variant="bodySm">
            Costo por operación usado para registrar gastos de generación y
            upscale.
          </Text>
        </BlockStack>
        {/* Contrapunto al aviso: deja claro qué NO hay que mantener aquí. En
            verde y no en gris porque es una buena noticia, no una advertencia. */}
        <Banner tone="success" title="El análisis de visión se registra solo">
          <Text as="p">
            Ese proveedor sí devuelve el coste real de cada llamada.
          </Text>
        </Banner>

        <SyncWarning />

        {rates === null ? (
          <InlineStack gap="200" blockAlign="center">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando tarifas…
            </Text>
          </InlineStack>
        ) : (
          <BlockStack gap="300">
            {rates.map((rate) => (
              <BlockStack key={rate.id} gap="150">
                <InlineStack
                  align="space-between"
                  blockAlign="center"
                  gap="200"
                >
                  <BlockStack gap="050">
                    <Text as="span" fontWeight="semibold" variant="bodySm">
                      {rate.model}
                    </Text>
                    <Text as="span" tone="subdued" variant="bodySm">
                      {rate.provider} · {rate.currency}
                    </Text>
                  </BlockStack>
                  {/* Un modelo auto-registrado nace a 0 y sus gastos se
                      contabilizan en cero hasta que se le pone precio. */}
                  {rate.amount === 0 && (
                    <Badge tone="warning">Sin configurar</Badge>
                  )}
                </InlineStack>

                {msg[rate.id] && (
                  <Banner
                    tone={msg[rate.id].tone}
                    onDismiss={() => clearMsg(rate.id)}
                  >
                    {msg[rate.id].text}
                  </Banner>
                )}

                <InlineStack gap="200" blockAlign="end">
                  <div style={{ width: 160 }}>
                    <TextField
                      label="Monto"
                      labelHidden
                      type="number"
                      step={0.000001}
                      value={drafts[rate.id]?.amount ?? ""}
                      onChange={(v) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [rate.id]: { ...prev[rate.id], amount: v },
                        }))
                      }
                      autoComplete="off"
                      prefix="$"
                    />
                  </div>
                  <div style={{ width: 180 }}>
                    <Select
                      label="Unidad"
                      labelHidden
                      options={RATE_UNIT_OPTIONS}
                      value={drafts[rate.id]?.unit ?? rate.unit}
                      onChange={(v) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [rate.id]: { ...prev[rate.id], unit: v },
                        }))
                      }
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="slim"
                    loading={saving[rate.id]}
                    disabled={!isDirty(rate, drafts[rate.id])}
                    onClick={() => handleSave(rate)}
                  >
                    Guardar
                  </Button>
                </InlineStack>
              </BlockStack>
            ))}

            <Divider />
            <NewRateForm onCreated={handleCreated} />
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}

/**
 * Aviso permanente (no descartable: es una condición del sistema, no una
 * notificación puntual) y plegado, para que no coma la pantalla a diario.
 */
function SyncWarning() {
  const [open, setOpen] = useState(false);

  return (
    <Banner tone="warning" title="fal.ai no informa de sus costes">
      <BlockStack gap="200">
        <Text as="p">
          Estas tarifas se mantienen a mano: si fal cambia sus precios, los
          gastos se registran mal sin avisar.
        </Text>

        <InlineStack>
          <Button
            variant="plain"
            size="slim"
            disclosure={open ? "up" : "down"}
            onClick={() => setOpen((prev) => !prev)}
            ariaExpanded={open}
            ariaControls="rates-sync-warning"
          >
            {open ? "Ocultar" : "Más detalles"}
          </Button>
        </InlineStack>

        <Collapsible open={open} id="rates-sync-warning">
          <Text as="p">
            fal devuelve la imagen, nunca el precio que cobró por ella, así que
            esta tabla es la única fuente para calcular los gastos de generación
            y upscale. Contrástala con{" "}
            <a
              href="https://fal.ai/pricing"
              target="_blank"
              rel="noopener noreferrer"
            >
              la página de precios de fal
            </a>{" "}
            al estrenar un modelo o si ves importes que no cuadran.
          </Text>
        </Collapsible>
      </BlockStack>
    </Banner>
  );
}

function toDraft(rate: ProviderRate): RateDraft {
  return { amount: String(rate.amount), unit: rate.unit };
}

function isDirty(rate: ProviderRate, draft?: RateDraft): boolean {
  if (!draft) return false;
  return draft.amount !== String(rate.amount) || draft.unit !== rate.unit;
}

/**
 * Alta de una tarifa antes de usar el modelo. Sin esto había que generar una
 * imagen con él para que se auto-registrara, y ese primer gasto quedaba en $0.
 */
function NewRateForm({
  onCreated,
}: {
  onCreated: (rate: ProviderRate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("fal");
  const [model, setModel] = useState("");
  const [unit, setUnit] = useState("per_image");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setProvider("fal");
    setModel("");
    setUnit("per_image");
    setAmount("");
    setCurrency("USD");
    setError(null);
  }

  async function handleCreate() {
    const value = parseFloat(amount);
    if (!model.trim()) {
      setError("Indica el identificador del modelo.");
      return;
    }
    if (isNaN(value) || value < 0) {
      setError("Monto inválido.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await adminApi.expenseRates.create({
        provider: provider.trim(),
        model: model.trim(),
        unit,
        amount: value,
        currency: currency.trim().toUpperCase() || "USD",
      });
      onCreated(created);
      reset();
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <InlineStack>
        <Button variant="plain" size="slim" onClick={() => setOpen(true)}>
          + Nueva tarifa
        </Button>
      </InlineStack>
    );
  }

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodySm" fontWeight="semibold">
        Nueva tarifa
      </Text>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      <InlineStack gap="200" blockAlign="end">
        <div style={{ width: 120 }}>
          <TextField
            label="Proveedor"
            value={provider}
            onChange={setProvider}
            autoComplete="off"
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <TextField
            label="Modelo"
            value={model}
            onChange={setModel}
            placeholder="fal-ai/flux/dev"
            autoComplete="off"
          />
        </div>
      </InlineStack>

      <InlineStack gap="200" blockAlign="end">
        <div style={{ width: 160 }}>
          <TextField
            label="Monto"
            type="number"
            step={0.000001}
            value={amount}
            onChange={setAmount}
            autoComplete="off"
            prefix="$"
          />
        </div>
        <div style={{ width: 180 }}>
          <Select
            label="Unidad"
            options={RATE_UNIT_OPTIONS}
            value={unit}
            onChange={setUnit}
            helpText={
              unit === "per_megapixel"
                ? "Se multiplica por los megapíxeles de salida."
                : undefined
            }
          />
        </div>
        <div style={{ width: 90 }}>
          <TextField
            label="Moneda"
            value={currency}
            onChange={setCurrency}
            autoComplete="off"
          />
        </div>
      </InlineStack>

      <InlineStack gap="200">
        <Button
          variant="primary"
          size="slim"
          loading={saving}
          onClick={handleCreate}
        >
          Crear tarifa
        </Button>
        <Button
          variant="plain"
          size="slim"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancelar
        </Button>
      </InlineStack>

      <Text as="p" variant="bodySm" tone="subdued">
        La unidad {RATE_UNIT_LABELS[unit]} determina cómo se calcula el gasto.
      </Text>
    </BlockStack>
  );
}
