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
  const [promptTemplate, setPromptTemplate] = useState("");
  const [descriptionExample, setDescriptionExample] = useState("");
  const [templateVarsText, setTemplateVarsText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setJsonError(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    let parsedTemplateVars: Record<string, unknown> | undefined;
    if (templateVarsText.trim()) {
      try {
        parsedTemplateVars = JSON.parse(templateVarsText);
      } catch {
        setJsonError("template_vars: JSON inválido");
        return;
      }
    }

    const parsedVisionTemp = visionTemperature.trim()
      ? Number(visionTemperature)
      : undefined;
    if (visionTemperature.trim() && isNaN(parsedVisionTemp!)) {
      setError("vision_temperature debe ser un número");
      return;
    }

    setSaving(true);
    try {
      const created = await adminApi.visionConfigs.create({
        name: name.trim(),
        description: description.trim() || undefined,
        visionModel: visionModel.trim() || undefined,
        visionTemperature: parsedVisionTemp,
        promptTemplate: promptTemplate || undefined,
        descriptionExample: descriptionExample || undefined,
        templateVars: parsedTemplateVars,
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
            {jsonError && (
              <Banner tone="critical" onDismiss={() => setJsonError(null)}>
                {jsonError}
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
                  </FormLayout.Group>

                  <TextField
                    label="prompt_template"
                    value={promptTemplate}
                    onChange={setPromptTemplate}
                    multiline={6}
                    autoComplete="off"
                    helpText="Template con [placeholders] para el VLM"
                  />

                  <TextField
                    label="description_example"
                    value={descriptionExample}
                    onChange={setDescriptionExample}
                    multiline={6}
                    autoComplete="off"
                    helpText="Ejemplo few-shot para guiar la salida del VLM"
                  />

                  <TextField
                    label="template_vars (JSON)"
                    value={templateVarsText}
                    onChange={setTemplateVarsText}
                    multiline={6}
                    autoComplete="off"
                    monospaced
                    helpText="Variables para sustituir {placeholders} en prompt_template"
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
