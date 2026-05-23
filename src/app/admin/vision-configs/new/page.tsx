"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Button,
  Banner,
  Text,
  InlineStack,
  BlockStack,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import { adminApi } from "@/entities/admin/api";

export default function NewVisionConfigPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visionModel, setVisionModel] = useState("");
  const [visionTemperature, setVisionTemperature] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const parsedVisionTemp = visionTemperature.trim()
      ? Number(visionTemperature)
      : undefined;
    if (visionTemperature.trim() && isNaN(parsedVisionTemp!)) {
      setError("vision_temperature debe ser un número");
      return;
    }

    let parsedMaxTokens: number | undefined;
    if (maxTokens.trim()) {
      const n = Number(maxTokens);
      if (!Number.isInteger(n) || n < 1) {
        setError("max_tokens debe ser un entero positivo");
        return;
      }
      parsedMaxTokens = n;
    }

    setSaving(true);
    try {
      const created = await adminApi.visionConfigs.create({
        name: name.trim(),
        description: description.trim() || undefined,
        visionModel: visionModel.trim() || undefined,
        visionTemperature: parsedVisionTemp,
        systemPrompt: systemPrompt.trim() || undefined,
        maxTokens: parsedMaxTokens,
      });
      router.push(`/admin/vision-configs/${created.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      backAction={{ url: "/admin/vision-configs", content: "Vision Configs" }}
      title="Crear vision config"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {error && (
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Datos básicos
                </Text>
                <FormLayout>
                  <TextField
                    label="Nombre"
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                    helpText="Identificador único (ej: watercolor-gemini-flash)"
                    requiredIndicator
                  />
                  <TextField
                    label="Descripción"
                    value={description}
                    onChange={setDescription}
                    multiline={2}
                    autoComplete="off"
                    helpText="Descripción breve del propósito de este config"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Modelo VLM
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="vision_model"
                      value={visionModel}
                      onChange={setVisionModel}
                      autoComplete="off"
                      helpText="Modelo VLM en OpenRouter (ej: google/gemini-2.5-flash)"
                    />
                    <TextField
                      label="vision_temperature"
                      type="number"
                      value={visionTemperature}
                      onChange={setVisionTemperature}
                      autoComplete="off"
                      helpText="0 – 2"
                    />
                    <TextField
                      label="max_tokens"
                      type="number"
                      value={maxTokens}
                      onChange={setMaxTokens}
                      autoComplete="off"
                      helpText="Entero ≥ 1. Vacío = default del servicio (400)."
                    />
                  </FormLayout.Group>

                  <TextField
                    label="system_prompt"
                    value={systemPrompt}
                    onChange={setSystemPrompt}
                    multiline={4}
                    autoComplete="off"
                    monospaced
                    helpText="Instrucciones de sistema para el VLM. Vacío = default del servicio."
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            <InlineStack align="end" gap="200">
              <Button url="/admin/vision-configs">Cancelar</Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleCreate}
              >
                Crear vision config
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
