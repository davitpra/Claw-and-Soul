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
  FormLayout,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { adminApi, AdminStyle, AdminStyleImage } from "@/entities/admin/api";

export default function AdminStyleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [style, setStyle] = useState<AdminStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  // Image state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<AdminStyleImage | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = async () => {
    const s = await adminApi.styles.getById(id);
    setStyle(s);
    setDisplayName(s.displayName);
    setDescription(s.description ?? "");
    setCategory(s.category);
    setSortOrder(String(s.sortOrder));
  };

  useEffect(() => {
    adminApi.styles
      .getById(id)
      .then((s) => {
        setStyle(s);
        setDisplayName(s.displayName);
        setDescription(s.description ?? "");
        setCategory(s.category);
        setSortOrder(String(s.sortOrder));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!style) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await adminApi.styles.update(style.id, {
        displayName,
        description: description || null,
        category,
        sortOrder: Number(sortOrder),
      });
      setStyle((prev) => (prev ? { ...prev, ...updated } : updated));
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
      await adminApi.styles.uploadImage(style.id, file);
      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setUploadingImage(false);
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
                  label="Descripción"
                  value={description}
                  onChange={setDescription}
                  multiline={3}
                  autoComplete="off"
                />
                <TextField
                  label="Categoría"
                  value={category}
                  onChange={setCategory}
                  autoComplete="off"
                />
                <TextField
                  label="Orden"
                  type="number"
                  value={sortOrder}
                  onChange={setSortOrder}
                  autoComplete="off"
                />
              </FormLayout>
              <InlineStack align="end">
                <Button variant="primary" loading={saving} onClick={handleSave}>
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
                              alt={img.caption ?? `Imagen ${img.orderIndex}`}
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

                          {img.caption && (
                            <Text
                              variant="bodySm"
                              tone="subdued"
                              as="p"
                              alignment="center"
                            >
                              {img.caption}
                            </Text>
                          )}

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

            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Configuración avanzada
                </Text>

                <InlineStack gap="600" wrap>
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      strategy_key
                    </Text>
                    <Text as="p" tone="subdued">
                      {style.strategyKey || "—"}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      fal_model
                    </Text>
                    <Text as="p" tone="subdued">
                      {style.falModel ?? "—"}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      vision_model
                    </Text>
                    <Text as="p" tone="subdued">
                      {style.visionModel ?? "—"}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      vision_temperature
                    </Text>
                    <Text as="p" tone="subdued">
                      {style.visionTemperature !== null
                        ? String(style.visionTemperature)
                        : "—"}
                    </Text>
                  </BlockStack>
                </InlineStack>

                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    thanks_url
                  </Text>
                  {style.thanksUrl ? (
                    <Thumbnail
                      source={style.thanksUrl}
                      alt={`Thanks image — ${style.displayName}`}
                      size="large"
                    />
                  ) : (
                    <Text as="p" tone="subdued">
                      —
                    </Text>
                  )}
                </BlockStack>

                <Divider />

                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    prompt_template
                  </Text>
                  {style.promptTemplate ? (
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <Text as="p" variant="bodySm">
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                          }}
                        >
                          {style.promptTemplate}
                        </span>
                      </Text>
                    </Box>
                  ) : (
                    <Text as="p" tone="subdued">
                      —
                    </Text>
                  )}
                </BlockStack>

                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    description_example
                  </Text>
                  {style.descriptionExample ? (
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <Text as="p" variant="bodySm">
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                          }}
                        >
                          {style.descriptionExample}
                        </span>
                      </Text>
                    </Box>
                  ) : (
                    <Text as="p" tone="subdued">
                      —
                    </Text>
                  )}
                </BlockStack>

                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    parameters
                  </Text>
                  {style.parameters &&
                  Object.keys(style.parameters).length > 0 ? (
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <Text as="p" variant="bodySm">
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                          }}
                        >
                          {JSON.stringify(style.parameters, null, 2)}
                        </span>
                      </Text>
                    </Box>
                  ) : (
                    <Text as="p" tone="subdued">
                      —
                    </Text>
                  )}
                </BlockStack>

                <BlockStack gap="100">
                  <Text variant="bodySm" as="span" fontWeight="bold">
                    template_vars
                  </Text>
                  {style.templateVars &&
                  Object.keys(style.templateVars).length > 0 ? (
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <Text as="p" variant="bodySm">
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                          }}
                        >
                          {JSON.stringify(style.templateVars, null, 2)}
                        </span>
                      </Text>
                    </Box>
                  ) : (
                    <Text as="p" tone="subdued">
                      —
                    </Text>
                  )}
                </BlockStack>
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
