"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
  Modal,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import {
  adminApi,
  AdminImageGenConfig,
  AdminConfigStyleUsage,
} from "@/entities/admin/api";

export default function AdminImageGenConfigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [config, setConfig] = useState<AdminImageGenConfig | null>(null);
  const [usages, setUsages] = useState<AdminConfigStyleUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [parametersText, setParametersText] = useState("");

  const hydrate = (c: AdminImageGenConfig) => {
    setName(c.name);
    setDescription(c.description ?? "");
    setProvider(c.provider ?? "");
    setModel(c.model ?? "");
    setParametersText(
      c.parameters ? JSON.stringify(c.parameters, null, 2) : "",
    );
  };

  const reload = async () => {
    const [c, u] = await Promise.all([
      adminApi.imageGenConfigs.getById(id),
      adminApi.imageGenConfigs.getStyles(id),
    ]);
    setConfig(c);
    setUsages(u);
    hydrate(c);
  };

  useEffect(() => {
    Promise.all([
      adminApi.imageGenConfigs.getById(id),
      adminApi.imageGenConfigs.getStyles(id),
    ])
      .then(([c, u]) => {
        setConfig(c);
        setUsages(u);
        hydrate(c);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!config) return;
    setJsonError(null);
    setSaveError(null);

    let parsedParameters: Record<string, unknown> | null = null;
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
      const updated = await adminApi.imageGenConfigs.update(config.id, {
        name,
        description: description || undefined,
        provider: provider || undefined,
        model: model || undefined,
        parameters: parsedParameters ?? undefined,
      });
      setConfig(updated);
      hydrate(updated);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!config) return;
    setToggling(true);
    try {
      await adminApi.imageGenConfigs.update(config.id, {
        isActive: !config.isActive,
      });
      await reload();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (force: boolean) => {
    if (!config) return;
    setDeleting(true);
    try {
      await adminApi.imageGenConfigs.delete(config.id, force);
      router.push("/admin/image-gen-configs");
    } catch (e: unknown) {
      setSaveError((e as Error).message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Page
        backAction={{
          url: "/admin/image-gen-configs",
          content: "Image Gen Configs",
        }}
        title="Cargando…"
      >
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner />
            <Text as="span" tone="subdued">
              Cargando image gen config…
            </Text>
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (error || !config) {
    return (
      <Page
        backAction={{
          url: "/admin/image-gen-configs",
          content: "Image Gen Configs",
        }}
        title="Image Gen Config"
      >
        <Banner tone="critical">
          {error ?? "Image gen config no encontrado."}
        </Banner>
      </Page>
    );
  }

  return (
    <Page
      backAction={{
        url: "/admin/image-gen-configs",
        content: "Image Gen Configs",
      }}
      title={config.name}
      titleMetadata={
        <Badge tone={config.isActive ? "success" : "enabled"}>
          {config.isActive ? "Activo" : "Inactivo"}
        </Badge>
      }
      secondaryActions={[
        {
          content: config.isActive ? "Desactivar" : "Activar",
          loading: toggling,
          onAction: handleToggle,
        },
        {
          content: "Eliminar",
          destructive: true,
          onAction: () => setConfirmDelete(true),
        },
      ]}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h2">
                Información
              </Text>

              <BlockStack gap="100">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  ID
                </Text>
                <Text as="p" tone="subdued" truncate>
                  {config.id}
                </Text>
              </BlockStack>

              <BlockStack gap="100">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Creado
                </Text>
                <Text as="p" tone="subdued">
                  {new Date(config.createdAt).toLocaleString("es-ES")}
                </Text>
              </BlockStack>

              <BlockStack gap="100">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Actualizado
                </Text>
                <Text as="p" tone="subdued">
                  {new Date(config.updatedAt).toLocaleString("es-ES")}
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    Estilos que lo usan
                  </Text>
                  <Badge tone="info">{String(usages.length)}</Badge>
                </InlineStack>
                {usages.length === 0 ? (
                  <Text as="p" tone="subdued" variant="bodySm">
                    Ningún estilo enlazado a este config.
                  </Text>
                ) : (
                  <BlockStack gap="100">
                    {usages.map((u) => (
                      <Link
                        key={u.id}
                        href={`/admin/styles/${u.id}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <InlineStack
                          gap="200"
                          blockAlign="center"
                          align="space-between"
                        >
                          <Text as="span" variant="bodySm">
                            {u.displayName}
                          </Text>
                          {!u.isActive && (
                            <Badge tone="enabled">Inactivo</Badge>
                          )}
                        </InlineStack>
                      </Link>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <BlockStack gap="400">
            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError(null)}>
                {saveError}
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
                  />
                  <TextField
                    label="Descripción"
                    value={description}
                    onChange={setDescription}
                    multiline={2}
                    autoComplete="off"
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
                  <FormLayout.Group>
                    <TextField
                      label="provider"
                      value={provider}
                      onChange={setProvider}
                      autoComplete="off"
                      helpText="ej: fal"
                    />
                    <TextField
                      label="model"
                      value={model}
                      onChange={setModel}
                      autoComplete="off"
                      helpText="ej: fal-ai/flux/dev"
                    />
                  </FormLayout.Group>

                  <TextField
                    label="parameters (JSON)"
                    value={parametersText}
                    onChange={setParametersText}
                    multiline={8}
                    autoComplete="off"
                    monospaced
                    helpText="Parámetros adicionales para la API del provider"
                  />
                </FormLayout>

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={handleSave}
                  >
                    Guardar cambios
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Modal
        open={confirmDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
        title="¿Eliminar image gen config?"
        primaryAction={{
          content: usages.length > 0 ? "Eliminar y desvincular" : "Eliminar",
          destructive: true,
          loading: deleting,
          onAction: () => handleDelete(usages.length > 0),
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: deleting,
            onAction: () => setConfirmDelete(false),
          },
        ]}
      >
        <Modal.Section>
          {usages.length > 0 ? (
            <Text as="p">
              Este image gen config está enlazado a <b>{usages.length}</b>{" "}
              estilo(s). Eliminarlo los desvinculará automáticamente (quedarán
              sin image gen config asignado).
            </Text>
          ) : (
            <Text as="p">
              Esta acción es permanente. No hay estilos enlazados a este config.
            </Text>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
