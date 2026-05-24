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

export default function NewImageGenConfigPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [parametersText, setParametersText] = useState("");

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

    let parsedParameters: Record<string, unknown> | undefined;
    if (parametersText.trim()) {
      try {
        parsedParameters = JSON.parse(parametersText);
      } catch {
        setJsonError("parameters: JSON inválido");
        return;
      }
    }

    setSaving(true);
    try {
      const created = await adminApi.imageGenConfigs.create({
        name: name.trim(),
        description: description.trim() || undefined,
        model: model.trim() || undefined,
        parameters: parsedParameters,
      });
      router.push(`/admin/image-gen-configs/${created.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      backAction={{
        url: "/admin/image-gen-configs",
        content: "Image Gen Configs",
      }}
      title="Crear image gen config"
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
                    helpText="Identificador único (ej: flux-dev-standard)"
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
                  Generador
                </Text>
                <FormLayout>
                  <TextField
                    label="model"
                    value={model}
                    onChange={setModel}
                    autoComplete="off"
                    helpText="ej: fal-ai/flux/dev"
                  />

                  <TextField
                    label="parameters (JSON)"
                    value={parametersText}
                    onChange={setParametersText}
                    multiline={8}
                    autoComplete="off"
                    monospaced
                    helpText="Parámetros adicionales para la API del modelo"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            <InlineStack align="end" gap="200">
              <Button url="/admin/image-gen-configs">Cancelar</Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleCreate}
              >
                Crear image gen config
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
