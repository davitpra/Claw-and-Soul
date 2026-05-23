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
  AdminVisionConfig,
  AdminConfigStyleUsage,
} from "@/entities/admin/api";

export default function AdminVisionConfigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [config, setConfig] = useState<AdminVisionConfig | null>(null);
  const [usages, setUsages] = useState<AdminConfigStyleUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visionModel, setVisionModel] = useState("");
  const [visionTemperature, setVisionTemperature] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState("");

  const hydrate = (c: AdminVisionConfig) => {
    setName(c.name);
    setDescription(c.description ?? "");
    setVisionModel(c.visionModel ?? "");
    setVisionTemperature(
      c.visionTemperature !== null ? String(c.visionTemperature) : "",
    );
    setSystemPrompt(c.systemPrompt ?? "");
    setMaxTokens(c.maxTokens !== null ? String(c.maxTokens) : "");
  };

  const reload = async () => {
    const [c, u] = await Promise.all([
      adminApi.visionConfigs.getById(id),
      adminApi.visionConfigs.getStyles(id),
    ]);
    setConfig(c);
    setUsages(u);
    hydrate(c);
  };

  useEffect(() => {
    Promise.all([
      adminApi.visionConfigs.getById(id),
      adminApi.visionConfigs.getStyles(id),
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
    setSaveError(null);

    const parsedVisionTemp = visionTemperature.trim()
      ? Number(visionTemperature)
      : null;
    if (visionTemperature.trim() && isNaN(parsedVisionTemp!)) {
      setSaveError("vision_temperature debe ser un número");
      return;
    }

    let parsedMaxTokens: number | null = null;
    if (maxTokens.trim()) {
      const n = Number(maxTokens);
      if (!Number.isInteger(n) || n < 1) {
        setSaveError("max_tokens debe ser un entero positivo");
        return;
      }
      parsedMaxTokens = n;
    }

    setSaving(true);
    try {
      const updated = await adminApi.visionConfigs.update(config.id, {
        name,
        description: description || undefined,
        visionModel: visionModel || undefined,
        visionTemperature: parsedVisionTemp ?? undefined,
        systemPrompt: systemPrompt || undefined,
        maxTokens: parsedMaxTokens ?? undefined,
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
      await adminApi.visionConfigs.update(config.id, {
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
      await adminApi.visionConfigs.delete(config.id, force);
      router.push("/admin/vision-configs");
    } catch (e: unknown) {
      setSaveError((e as Error).message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Page
        backAction={{ url: "/admin/vision-configs", content: "Vision Configs" }}
        title="Cargando…"
      >
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner />
            <Text as="span" tone="subdued">
              Cargando vision config…
            </Text>
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (error || !config) {
    return (
      <Page
        backAction={{ url: "/admin/vision-configs", content: "Vision Configs" }}
        title="Vision Config"
      >
        <Banner tone="critical">{error ?? "Vision config no encontrado."}</Banner>
      </Page>
    );
  }

  return (
    <Page
      backAction={{ url: "/admin/vision-configs", content: "Vision Configs" }}
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
                  Modelo VLM
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="vision_model"
                      value={visionModel}
                      onChange={setVisionModel}
                      autoComplete="off"
                      helpText="Modelo VLM en OpenRouter"
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
        title="¿Eliminar vision config?"
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
              Este vision config está enlazado a <b>{usages.length}</b> estilo(s).
              Eliminarlo los desvinculará automáticamente (quedarán sin vision
              config asignado).
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
