"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
  Thumbnail,
  Modal,
  TextField,
  Select,
  FormLayout,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminStyle,
  AdminStyleImage,
  AdminVisionConfig,
  AdminImageGenConfig,
} from "@/entities/admin/api";

const UNASSIGNED = "";

export default function AdminStyleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [style, setStyle] = useState<AdminStyle | null>(null);
  const [visionConfigs, setVisionConfigs] = useState<AdminVisionConfig[]>([]);
  const [imageGenConfigs, setImageGenConfigs] = useState<
    AdminImageGenConfig[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // Sidebar form state
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");

  // Pipeline form state
  const [strategyKey, setStrategyKey] = useState("");
  const [visionConfigId, setVisionConfigId] = useState<string>(UNASSIGNED);
  const [imageGenConfigId, setImageGenConfigId] =
    useState<string>(UNASSIGNED);

  // Image state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<AdminStyleImage | null>(
    null,
  );
  const [uploadAlt, setUploadAlt] = useState("");
  const [editingAlt, setEditingAlt] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hydrateForm = (s: AdminStyle) => {
    setDisplayName(s.displayName);
    setCategory(s.category);
    setStrategyKey(s.strategyKey ?? "");
    setVisionConfigId(s.visionConfigId ?? UNASSIGNED);
    setImageGenConfigId(s.imageGenConfigId ?? UNASSIGNED);
  };

  const reload = async () => {
    const s = await adminApi.styles.getById(id);
    setStyle(s);
    hydrateForm(s);
    setEditingAlt({});
  };

  useEffect(() => {
    Promise.all([
      adminApi.styles.getById(id),
      adminApi.visionConfigs.list(),
      adminApi.imageGenConfigs.list(),
    ])
      .then(([s, vc, igc]) => {
        setStyle(s);
        setVisionConfigs(vc);
        setImageGenConfigs(igc);
        hydrateForm(s);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveBasics = async () => {
    if (!style) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        displayName,
        category,
      });
      setStyle((prev) => (prev ? { ...prev, ...updated } : updated));
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePipeline = async () => {
    if (!style) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        strategyKey,
        visionConfigId: visionConfigId || null,
        imageGenConfigId: imageGenConfigId || null,
      });
      setStyle(updated);
      hydrateForm(updated);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!style) return;
    setToggling(true);
    try {
      if (style.isActive) {
        await adminApi.styles.deactivate(style.id);
      } else {
        await adminApi.styles.update(style.id, { isActive: true });
      }
      await reload();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setToggling(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !style) return;
    e.target.value = "";
    setUploadingImage(true);
    try {
      await adminApi.styles.uploadImage(style.id, file, uploadAlt || undefined);
      setUploadAlt("");
      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveAlt = async (img: AdminStyleImage, value: string) => {
    if (!style) return;
    setImageActionId(img.id);
    try {
      await adminApi.styles.updateImage(style.id, img.id, { altImage: value });
      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setImageActionId(null);
    }
  };

  const handleSetPrimary = async (img: AdminStyleImage) => {
    if (!style) return;
    setImageActionId(img.id);
    try {
      await adminApi.styles.updateImage(style.id, img.id, { isPrimary: true });
      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setImageActionId(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!deletingImage || !style) return;
    setImageActionId(deletingImage.id);
    try {
      await adminApi.styles.deleteImage(style.id, deletingImage.id);
      setDeletingImage(null);
      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setImageActionId(null);
    }
  };

  if (loading) {
    return (
      <Page
        backAction={{ url: "/admin/styles", content: "Estilos" }}
        title="Cargando…"
      >
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner />
            <Text as="span" tone="subdued">
              Cargando estilo…
            </Text>
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (error || !style) {
    return (
      <Page
        backAction={{ url: "/admin/styles", content: "Estilos" }}
        title="Estilo"
      >
        <Banner tone="critical">{error ?? "Estilo no encontrado."}</Banner>
      </Page>
    );
  }

  const visionOptions = [
    { label: "— Sin asignar —", value: UNASSIGNED },
    ...visionConfigs
      .filter((c) => c.isActive || c.id === style.visionConfigId)
      .map((c) => ({
        label: c.isActive ? c.name : `${c.name} (inactivo)`,
        value: c.id,
      })),
  ];

  const imageGenOptions = [
    { label: "— Sin asignar —", value: UNASSIGNED },
    ...imageGenConfigs
      .filter((c) => c.isActive || c.id === style.imageGenConfigId)
      .map((c) => ({
        label: c.isActive ? c.name : `${c.name} (inactivo)`,
        value: c.id,
      })),
  ];

  return (
    <Page
      backAction={{ url: "/admin/styles", content: "Estilos" }}
      title={style.displayName}
      subtitle={style.name}
      titleMetadata={
        <Badge tone={style.isActive ? "success" : "enabled"}>
          {style.isActive ? "Activo" : "Inactivo"}
        </Badge>
      }
      secondaryActions={[
        {
          content: style.isActive ? "Desactivar" : "Activar",
          loading: toggling,
          onAction: handleToggle,
        },
      ]}
    >
      <Layout>
        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h2">
                Editar
              </Text>
              <FormLayout>
                <TextField
                  label="Nombre visible"
                  value={displayName}
                  onChange={setDisplayName}
                  autoComplete="off"
                />
                <TextField
                  label="Categoría"
                  value={category}
                  onChange={setCategory}
                  autoComplete="off"
                />
              </FormLayout>
              <InlineStack align="end">
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={handleSaveBasics}
                >
                  Guardar cambios
                </Button>
              </InlineStack>

              <Divider />

              {style.previewUrl && (
                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    Vista previa
                  </Text>
                  <Thumbnail
                    source={style.previewUrl}
                    alt={style.displayName}
                    size="large"
                  />
                </BlockStack>
              )}

              <BlockStack gap="100">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Slug
                </Text>
                <Text as="p" tone="subdued">
                  {style.name}
                </Text>
              </BlockStack>

              <BlockStack gap="100">
                <Text variant="bodySm" as="span" fontWeight="bold">
                  Creado
                </Text>
                <Text as="p" tone="subdued">
                  {new Date(style.createdAt).toLocaleString("es-ES")}
                </Text>
              </BlockStack>

              {style._count && (
                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    Uso
                  </Text>
                  <Text as="p" tone="subdued">
                    {style._count.generations} generaciones ·{" "}
                    {style._count.productReferences} productos
                  </Text>
                </BlockStack>
              )}

              {style.thanksUrl && (
                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    Thanks URL
                  </Text>
                  <Text as="p" tone="subdued" truncate>
                    {style.thanksUrl}
                  </Text>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Main */}
        <Layout.Section>
          <BlockStack gap="400">
            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError(null)}>
                {saveError}
              </Banner>
            )}

            {/* Galería de imágenes */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text variant="headingSm" as="h2">
                      Galería de imágenes
                    </Text>
                    <Badge tone="info">{String(style.images.length)}</Badge>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    {uploadingImage && <Spinner size="small" />}
                    <div style={{ width: 200 }}>
                      <TextField
                        label=""
                        labelHidden
                        placeholder="Alt de la imagen (opcional)"
                        value={uploadAlt}
                        onChange={setUploadAlt}
                        autoComplete="off"
                        disabled={uploadingImage}
                      />
                    </div>
                    <Button
                      size="slim"
                      loading={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Subir imagen
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleUpload}
                    />
                  </InlineStack>
                </InlineStack>

                {style.images.length === 0 ? (
                  <Box padding="400">
                    <Text as="p" tone="subdued" alignment="center">
                      Sin imágenes. Sube la primera imagen para este estilo.
                    </Text>
                  </Box>
                ) : (
                  <InlineStack gap="400" wrap>
                    {style.images.map((img) => (
                      <Box
                        key={img.id}
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                        padding="300"
                      >
                        <BlockStack gap="200" inlineAlign="center">
                          <div style={{ position: "relative" }}>
                            <Thumbnail
                              source={img.imageUrl}
                              alt={img.altImage ?? `Imagen ${img.orderIndex}`}
                              size="large"
                            />
                            {imageActionId === img.id && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "rgba(255,255,255,0.7)",
                                  borderRadius: 6,
                                }}
                              >
                                <Spinner size="small" />
                              </div>
                            )}
                          </div>

                          {img.isPrimary && (
                            <Badge tone="success">Primaria</Badge>
                          )}

                          <TextField
                            label="Alt"
                            labelHidden
                            placeholder="Alt de la imagen"
                            value={editingAlt[img.id] ?? img.altImage ?? ""}
                            onChange={(val) =>
                              setEditingAlt((prev) => ({
                                ...prev,
                                [img.id]: val,
                              }))
                            }
                            onBlur={() => {
                              const val = editingAlt[img.id];
                              if (
                                val !== undefined &&
                                val !== (img.altImage ?? "")
                              ) {
                                handleSaveAlt(img, val);
                              }
                            }}
                            autoComplete="off"
                            disabled={imageActionId !== null}
                          />

                          <InlineStack gap="100">
                            {!img.isPrimary && (
                              <Button
                                size="slim"
                                variant="plain"
                                disabled={imageActionId !== null}
                                onClick={() => handleSetPrimary(img)}
                              >
                                Marcar primaria
                              </Button>
                            )}
                            <Button
                              size="slim"
                              variant="plain"
                              tone="critical"
                              icon={DeleteIcon}
                              disabled={imageActionId !== null}
                              accessibilityLabel="Eliminar imagen"
                              onClick={() => setDeletingImage(img)}
                            />
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    ))}
                  </InlineStack>
                )}
              </BlockStack>
            </Card>

            {/* Pipeline (strategy + configs) */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Pipeline
                </Text>
                <FormLayout>
                  <TextField
                    label="strategy_key"
                    value={strategyKey}
                    onChange={setStrategyKey}
                    autoComplete="off"
                    helpText="Estrategia de pipeline (ej: default)"
                  />

                  <Select
                    label="Vision config"
                    options={visionOptions}
                    value={visionConfigId}
                    onChange={setVisionConfigId}
                    helpText="Configuración del VLM (descripción de la imagen)"
                  />

                  <Select
                    label="Image gen config"
                    options={imageGenOptions}
                    value={imageGenConfigId}
                    onChange={setImageGenConfigId}
                    helpText="Configuración del generador de imagen (FAL u otro)"
                  />
                </FormLayout>

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={handleSavePipeline}
                  >
                    Guardar cambios
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Vision Config preview */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingSm" as="h2">
                    Vision Config enlazado
                  </Text>
                  <InlineStack gap="100">
                    {style.visionConfig && (
                      <Button
                        size="slim"
                        url={`/admin/vision-configs/${style.visionConfig.id}`}
                      >
                        Editar este config
                      </Button>
                    )}
                    <Button
                      size="slim"
                      variant="plain"
                      url="/admin/vision-configs"
                    >
                      Gestionar todos →
                    </Button>
                  </InlineStack>
                </InlineStack>

                {style.visionConfig ? (
                  <VisionConfigPreview config={style.visionConfig} />
                ) : (
                  <Box padding="400">
                    <Text as="p" tone="subdued" alignment="center">
                      Este estilo no tiene un vision config asignado.
                      Selecciona uno arriba y guarda los cambios.
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>

            {/* Image Gen Config preview */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingSm" as="h2">
                    Image Gen Config enlazado
                  </Text>
                  <InlineStack gap="100">
                    {style.imageGenConfig && (
                      <Button
                        size="slim"
                        url={`/admin/image-gen-configs/${style.imageGenConfig.id}`}
                      >
                        Editar este config
                      </Button>
                    )}
                    <Button
                      size="slim"
                      variant="plain"
                      url="/admin/image-gen-configs"
                    >
                      Gestionar todos →
                    </Button>
                  </InlineStack>
                </InlineStack>

                {style.imageGenConfig ? (
                  <ImageGenConfigPreview config={style.imageGenConfig} />
                ) : (
                  <Box padding="400">
                    <Text as="p" tone="subdued" alignment="center">
                      Este estilo no tiene un image gen config asignado.
                      Selecciona uno arriba y guarda los cambios.
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Modal
        open={deletingImage !== null}
        onClose={() => {
          if (!imageActionId) setDeletingImage(null);
        }}
        title="¿Eliminar imagen?"
        primaryAction={{
          content: "Eliminar",
          destructive: true,
          loading: imageActionId !== null,
          onAction: handleDeleteImage,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: imageActionId !== null,
            onAction: () => setDeletingImage(null),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Esta acción eliminará la imagen permanentemente del catálogo y del
            almacenamiento. No se puede deshacer.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

function ConfigPreviewField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <BlockStack gap="050">
      <Text variant="bodySm" as="span" tone="subdued">
        {label}
      </Text>
      <Text as="p" variant="bodyMd">
        {value}
      </Text>
    </BlockStack>
  );
}

function VisionConfigPreview({ config }: { config: AdminVisionConfig }) {
  const templateVarsCount = config.templateVars
    ? Object.keys(config.templateVars).length
    : 0;

  return (
    <BlockStack gap="300">
      <InlineStack gap="400" wrap>
        <ConfigPreviewField label="Nombre" value={config.name} />
        <ConfigPreviewField
          label="Modelo"
          value={config.visionModel ?? "—"}
        />
        <ConfigPreviewField
          label="Temperatura"
          value={
            config.visionTemperature !== null ? config.visionTemperature : "—"
          }
        />
        <ConfigPreviewField
          label="Estado"
          value={
            <Badge tone={config.isActive ? "success" : "enabled"}>
              {config.isActive ? "Activo" : "Inactivo"}
            </Badge>
          }
        />
      </InlineStack>

      {config.promptTemplate && (
        <BlockStack gap="100">
          <Text variant="bodySm" as="span" tone="subdued">
            prompt_template
          </Text>
          <Box
            background="bg-surface-secondary"
            padding="300"
            borderRadius="200"
          >
            <Text as="p" variant="bodySm" truncate>
              {config.promptTemplate.split("\n").slice(0, 3).join(" · ")}
            </Text>
          </Box>
        </BlockStack>
      )}

      {templateVarsCount > 0 && (
        <Text as="p" variant="bodySm" tone="subdued">
          {templateVarsCount} variable{templateVarsCount === 1 ? "" : "s"} en{" "}
          <code>template_vars</code>.
        </Text>
      )}
    </BlockStack>
  );
}

function ImageGenConfigPreview({ config }: { config: AdminImageGenConfig }) {
  const parametersCount = config.parameters
    ? Object.keys(config.parameters).length
    : 0;

  return (
    <BlockStack gap="300">
      <InlineStack gap="400" wrap>
        <ConfigPreviewField label="Nombre" value={config.name} />
        <ConfigPreviewField
          label="Provider"
          value={<Badge tone="info">{config.provider}</Badge>}
        />
        <ConfigPreviewField label="Modelo" value={config.model ?? "—"} />
        <ConfigPreviewField
          label="Estado"
          value={
            <Badge tone={config.isActive ? "success" : "enabled"}>
              {config.isActive ? "Activo" : "Inactivo"}
            </Badge>
          }
        />
      </InlineStack>

      {parametersCount > 0 && (
        <Text as="p" variant="bodySm" tone="subdued">
          {parametersCount} parámetro{parametersCount === 1 ? "" : "s"} en{" "}
          <code>parameters</code>.
        </Text>
      )}
    </BlockStack>
  );
}
