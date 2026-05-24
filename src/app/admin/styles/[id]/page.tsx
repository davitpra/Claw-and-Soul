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
  RangeSlider,
  ColorPicker,
  Popover,
} from "@shopify/polaris";
import { DeleteIcon, ClipboardIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminStyle,
  AdminStyleImage,
  AdminVisionConfig,
  AdminImageGenConfig,
} from "@/entities/admin/api";
import { useAdminGenerationStatus } from "@/hooks/useAdminGenerationStatus";
import { hexToHsb, hsbToHex, type HsbColor } from "@/lib/colorUtils";

const UNASSIGNED = "";

type TemplateVarOption =
  | { type: "select"; label: string; options: { value: string; label: string }[]; default: string; required?: boolean }
  | { type: "slider"; label: string; min: number; max: number; step?: number; default: number }
  | { type: "color"; label: string; default: string };

const EXAMPLE_TEMPLATE_VAR_OPTIONS = `{
  "background": {
    "type": "select",
    "label": "Fondo",
    "options": [
      { "value": "white", "label": "Blanco" },
      { "value": "blue", "label": "Azul" }
    ],
    "default": "white",
    "required": true
  },
  "colorCount": {
    "type": "slider",
    "label": "Cantidad de colores",
    "min": 3,
    "max": 10,
    "step": 1,
    "default": 5
  },
  "accentColor": {
    "type": "color",
    "label": "Color de acento",
    "default": "#448da6"
  }
}`;

function validateTemplateVarOptions(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    return "debe ser un objeto";
  }
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return `"${key}" debe ser un objeto`;
    }
    const opt = raw as Record<string, unknown>;
    if (opt.type === "select") {
      if (!Array.isArray(opt.options) || opt.options.length === 0) {
        return `"${key}.options" debe ser un array no vacío`;
      }
      const allowed = (opt.options as Array<Record<string, unknown>>).map(
        (o) => o.value,
      );
      if (!allowed.includes(opt.default)) {
        return `"${key}.default" no está en options`;
      }
    } else if (opt.type === "slider") {
      const {
        min,
        max,
        default: def,
      } = opt as {
        min: number;
        max: number;
        default: number;
      };
      if (typeof min !== "number" || typeof max !== "number") {
        return `"${key}.min" y "${key}.max" deben ser números`;
      }
      if (min >= max) return `"${key}.min" debe ser menor que "${key}.max"`;
      if (typeof def !== "number" || def < min || def > max) {
        return `"${key}.default" fuera del rango [${min}, ${max}]`;
      }
    } else if (opt.type === "color") {
      if (
        typeof opt.default !== "string" ||
        !/^#[0-9a-fA-F]{6}$/.test(opt.default)
      ) {
        return `"${key}.default" debe ser un hex válido (#RRGGBB)`;
      }
    } else {
      return `"${key}.type" debe ser "select", "slider" o "color"`;
    }
    if (typeof opt.label !== "string" || !opt.label.trim()) {
      return `"${key}.label" es requerido`;
    }
  }
  return null;
}

export default function AdminStyleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [style, setStyle] = useState<AdminStyle | null>(null);
  const [visionConfigs, setVisionConfigs] = useState<AdminVisionConfig[]>([]);
  const [imageGenConfigs, setImageGenConfigs] = useState<AdminImageGenConfig[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // Sidebar form state
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");
  const [thanksUrl, setThanksUrl] = useState("");
  const [thanksUrlImgError, setThanksUrlImgError] = useState(false);

  // Pipeline form state
  const [strategyKey, setStrategyKey] = useState("");
  const [visionConfigId, setVisionConfigId] = useState<string>(UNASSIGNED);
  const [imageGenConfigId, setImageGenConfigId] = useState<string>(UNASSIGNED);

  // Prompt template form state
  const [promptTemplate, setPromptTemplate] = useState("");
  const [templateVarsText, setTemplateVarsText] = useState("");
  const [templateVarOptionsText, setTemplateVarOptionsText] = useState("");
  const [jsonPromptError, setJsonPromptError] = useState<string | null>(null);
  const [jsonOptionsError, setJsonOptionsError] = useState<string | null>(null);

  // Image state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<AdminStyleImage | null>(
    null,
  );
  const [uploadAlt, setUploadAlt] = useState("");
  const [editingAlt, setEditingAlt] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<AdminStyleImage | null>(null);
  const [viewerAlt, setViewerAlt] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Test generation state
  const [testGenId, setTestGenId] = useState<string | null>(null);
  const [testGenRunning, setTestGenRunning] = useState(false);
  const [testGenError, setTestGenError] = useState<string | null>(null);
  const [testGenSuccess, setTestGenSuccess] = useState(false);
  const [testPetName, setTestPetName] = useState("Test Pet");
  const [testPetSpecies, setTestPetSpecies] = useState("dog");
  const [testPetBreed, setTestPetBreed] = useState("");
  const [testAspectRatio, setTestAspectRatio] = useState("");
  const [userSelections, setUserSelections] = useState<Record<string, string | number>>({});
  const [colorHsbs, setColorHsbs] = useState<Record<string, HsbColor>>({});
  const [colorPopovers, setColorPopovers] = useState<Record<string, boolean>>({});
  const testFileInputRef = useRef<HTMLInputElement>(null);

  const testGenStatus = useAdminGenerationStatus(testGenId);

  const hydrateForm = (s: AdminStyle) => {
    setDisplayName(s.displayName);
    setCategory(s.category);
    setThanksUrl(s.thanksUrl ?? "");
    setStrategyKey(s.strategyKey ?? "");
    setVisionConfigId(s.visionConfigId ?? UNASSIGNED);
    setImageGenConfigId(s.imageGenConfigId ?? UNASSIGNED);
    setPromptTemplate(s.promptTemplate ?? "");
    setTemplateVarsText(
      s.templateVars ? JSON.stringify(s.templateVars, null, 2) : "",
    );
    setTemplateVarOptionsText(
      s.templateVarOptions ? JSON.stringify(s.templateVarOptions, null, 2) : "",
    );
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

  useEffect(() => {
    if (!style?.templateVarOptions) return;
    setUserSelections((prev) => {
      const next = { ...prev };
      const newHsbs: Record<string, HsbColor> = {};
      for (const [key, raw] of Object.entries(style.templateVarOptions as Record<string, unknown>)) {
        const opt = raw as TemplateVarOption;
        if (!(key in next)) {
          next[key] = opt.default as string | number;
          if (opt.type === "color") {
            newHsbs[key] = hexToHsb(opt.default as string);
          }
        }
      }
      if (Object.keys(newHsbs).length > 0) {
        setColorHsbs((prev) => ({ ...newHsbs, ...prev }));
      }
      return next;
    });
  }, [style?.templateVarOptions]);

  useEffect(() => {
    if (testGenStatus.status === "completed") {
      setTestGenRunning(false);
      setTestGenId(null);
      setTestGenSuccess(true);
      reload();
    } else if (testGenStatus.status === "failed") {
      setTestGenRunning(false);
      setTestGenId(null);
      setTestGenError(
        testGenStatus.errorMessage ?? "La generación falló. Revisá los logs.",
      );
    }
  }, [testGenStatus.status]);

  const updateSelection = (key: string, value: string | number) =>
    setUserSelections((prev) => ({ ...prev, [key]: value }));

  const handleRunTestGeneration = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !style) return;
    e.target.value = "";
    setTestGenError(null);
    setTestGenSuccess(false);
    setTestGenRunning(true);
    try {
      const result = await adminApi.styles.runTestGeneration(style.id, file, {
        petName: testPetName || undefined,
        petSpecies: testPetSpecies || undefined,
        petBreed: testPetBreed || undefined,
        aspectRatio: testAspectRatio || undefined,
        userSelections,
      });
      setTestGenId(result.generationId);
    } catch (err: unknown) {
      setTestGenRunning(false);
      setTestGenError((err as Error).message);
    }
  };

  const handleSaveBasics = async () => {
    if (!style) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        displayName,
        category,
        thanksUrl: thanksUrl.trim() ? thanksUrl.trim() : null,
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

  const handleSavePrompt = async () => {
    if (!style) return;
    setJsonPromptError(null);
    setSaveError(null);

    let parsedTemplateVars: Record<string, unknown> | null = null;
    if (templateVarsText.trim()) {
      try {
        parsedTemplateVars = JSON.parse(templateVarsText);
      } catch {
        setJsonPromptError("template_vars: JSON inválido");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        promptTemplate: promptTemplate || undefined,
        templateVars: parsedTemplateVars ?? undefined,
      });
      setStyle(updated);
      hydrateForm(updated);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplateVarOptions = async () => {
    if (!style) return;
    setJsonOptionsError(null);
    setSaveError(null);

    let parsed: Record<string, unknown> | null = null;
    if (templateVarOptionsText.trim()) {
      try {
        parsed = JSON.parse(templateVarOptionsText);
      } catch {
        setJsonOptionsError("template_var_options: JSON inválido");
        return;
      }
      const validationError = validateTemplateVarOptions(parsed);
      if (validationError) {
        setJsonOptionsError(`template_var_options: ${validationError}`);
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        templateVarOptions: parsed ?? undefined,
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

  const openViewer = (img: AdminStyleImage) => {
    setViewingImage(img);
    setViewerAlt(img.altImage ?? "");
    setCopiedUrl(false);
  };

  const closeViewer = () => {
    if (imageActionId) return;
    setViewingImage(null);
  };

  const handleViewerSaveAlt = async () => {
    if (!viewingImage) return;
    if (viewerAlt === (viewingImage.altImage ?? "")) return;
    await handleSaveAlt(viewingImage, viewerAlt);
    setViewingImage((prev) =>
      prev ? { ...prev, altImage: viewerAlt } : prev,
    );
  };

  const handleCopyUrl = async () => {
    if (!viewingImage) return;
    await navigator.clipboard.writeText(viewingImage.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
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
          <BlockStack gap="200">
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
                  <Button
                    size="slim"
                    variant="plain"
                    url="/admin/vision-configs"
                  >
                    Gestionar vision models →
                  </Button>

                  <Select
                    label="Image gen config"
                    options={imageGenOptions}
                    value={imageGenConfigId}
                    onChange={setImageGenConfigId}
                    helpText="Configuración del generador de imagen (FAL u otro)"
                  />
                  <Button
                    size="slim"
                    variant="plain"
                    url="/admin/image-gen-configs"
                  >
                    Gestionar generation models →
                  </Button>
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
            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Thanks you page URL
                </Text>
                <TextField
                  label="Thanks URL"
                  type="url"
                  value={thanksUrl}
                  onChange={(val) => {
                    setThanksUrl(val);
                    setThanksUrlImgError(false);
                  }}
                  autoComplete="off"
                  placeholder="https://…"
                  helpText="URL a la que se redirige tras una compra exitosa de un producto con este estilo."
                />
                {thanksUrl.trim() && (
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      Previsualización
                    </Text>
                    {thanksUrlImgError ? (
                      <Box
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                        padding="300"
                      >
                        <Text as="p" tone="subdued" variant="bodySm">
                          No se puede previsualizar como imagen. Verifica que la
                          URL apunte a un recurso de imagen accesible.
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                        padding="200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thanksUrl}
                          alt="Vista previa de Thanks URL"
                          onError={() => setThanksUrlImgError(true)}
                          style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            maxHeight: 240,
                            objectFit: "contain",
                            borderRadius: 6,
                          }}
                        />
                      </Box>
                    )}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* Main */}
        <Layout.Section>
          <BlockStack gap="400">
            {saveError && (
              <Banner tone="critical" onDismiss={() => setSaveError(null)}>
                {saveError}
              </Banner>
            )}
            {jsonPromptError && (
              <Banner
                tone="critical"
                onDismiss={() => setJsonPromptError(null)}
              >
                {jsonPromptError}
              </Banner>
            )}
            {jsonOptionsError && (
              <Banner
                tone="critical"
                onDismiss={() => setJsonOptionsError(null)}
              >
                {jsonOptionsError}
              </Banner>
            )}

            {/* Generar imagen de prueba */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingSm" as="h2">
                    Generar imagen de prueba
                  </Text>
                  {(testGenRunning ||
                    testGenStatus.status === "processing" ||
                    testGenStatus.status === "pending") && (
                    <InlineStack gap="200" blockAlign="center">
                      <Spinner size="small" />
                      <Text as="span" tone="subdued">
                        {testGenStatus.status === "processing"
                          ? "Generando…"
                          : "Encolando…"}
                      </Text>
                    </InlineStack>
                  )}
                </InlineStack>
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

                {testGenError && (
                  <Banner
                    tone="critical"
                    onDismiss={() => setTestGenError(null)}
                  >
                    {testGenError}
                  </Banner>
                )}
                {testGenSuccess && (
                  <Banner
                    tone="success"
                    onDismiss={() => setTestGenSuccess(false)}
                  >
                    Imagen generada y agregada a la galería.
                  </Banner>
                )}

                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Nombre de mascota"
                      value={testPetName}
                      onChange={setTestPetName}
                      autoComplete="off"
                      disabled={testGenRunning}
                    />
                    <TextField
                      label="Especie"
                      value={testPetSpecies}
                      onChange={setTestPetSpecies}
                      autoComplete="off"
                      disabled={testGenRunning}
                    />
                    <TextField
                      label="Raza (opcional)"
                      value={testPetBreed}
                      onChange={setTestPetBreed}
                      autoComplete="off"
                      disabled={testGenRunning}
                    />
                    <Select
                      label="Aspect ratio"
                      options={[
                        { label: "Default (FAL decide)", value: "" },
                        { label: "1:1 — cuadrado", value: "1:1" },
                        { label: "4:5 — retrato típico", value: "4:5" },
                        { label: "3:4 — retrato", value: "3:4" },
                        { label: "2:3 — retrato vertical", value: "2:3" },
                        { label: "16:9 — landscape", value: "16:9" },
                        { label: "9:16 — vertical / stories", value: "9:16" },
                      ]}
                      value={testAspectRatio}
                      onChange={setTestAspectRatio}
                      disabled={testGenRunning}
                    />
                  </FormLayout.Group>
                </FormLayout>

                {style.templateVarOptions &&
                  Object.keys(style.templateVarOptions).length > 0 && (
                    <BlockStack gap="300">
                      <Text variant="headingXs" as="h3">
                        Opciones del template
                      </Text>
                      <FormLayout>
                        {Object.entries(
                          style.templateVarOptions as Record<string, unknown>,
                        ).map(([key, raw]) => {
                          const opt = raw as TemplateVarOption;
                          if (opt.type === "select") {
                            return (
                              <Select
                                key={key}
                                label={opt.label}
                                options={[
                                  ...(opt.required
                                    ? []
                                    : [
                                        {
                                          label: "— sin selección —",
                                          value: "",
                                        },
                                      ]),
                                  ...opt.options.map((o) => ({
                                    label: o.label,
                                    value: o.value,
                                  })),
                                ]}
                                value={String(
                                  userSelections[key] ?? opt.default ?? "",
                                )}
                                onChange={(v) => updateSelection(key, v)}
                                disabled={testGenRunning}
                              />
                            );
                          }
                          if (opt.type === "slider") {
                            return (
                              <RangeSlider
                                key={key}
                                label={opt.label}
                                value={Number(
                                  userSelections[key] ?? opt.default,
                                )}
                                min={opt.min}
                                max={opt.max}
                                step={opt.step ?? 1}
                                output
                                onChange={(v) =>
                                  updateSelection(key, Number(v))
                                }
                                disabled={testGenRunning}
                              />
                            );
                          }
                          if (opt.type === "color") {
                            const currentHex = String(
                              userSelections[key] ?? opt.default,
                            );
                            const hsb =
                              colorHsbs[key] ?? hexToHsb(currentHex);
                            return (
                              <BlockStack key={key} gap="100">
                                <Text as="span" variant="bodyMd">
                                  {opt.label}
                                </Text>
                                <InlineStack gap="200" blockAlign="center">
                                  <Popover
                                    active={!!colorPopovers[key]}
                                    onClose={() =>
                                      setColorPopovers((p) => ({
                                        ...p,
                                        [key]: false,
                                      }))
                                    }
                                    activator={
                                      <button
                                        type="button"
                                        disabled={testGenRunning}
                                        onClick={() =>
                                          setColorPopovers((p) => ({
                                            ...p,
                                            [key]: !p[key],
                                          }))
                                        }
                                        style={{
                                          cursor: "pointer",
                                          padding: "6px 12px",
                                          border: "1px solid #ccc",
                                          borderRadius: 4,
                                          background: "white",
                                          display: "flex",
                                          gap: 8,
                                          alignItems: "center",
                                          opacity: testGenRunning ? 0.5 : 1,
                                        }}
                                      >
                                        <span
                                          style={{
                                            background: currentHex,
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            border: "1px solid #ccc",
                                            display: "inline-block",
                                          }}
                                        />
                                        <span>{currentHex}</span>
                                      </button>
                                    }
                                  >
                                    <Box padding="300">
                                      <ColorPicker
                                        color={hsb}
                                        onChange={(newHsb) => {
                                          setColorHsbs((p) => ({
                                            ...p,
                                            [key]: newHsb,
                                          }));
                                          updateSelection(
                                            key,
                                            hsbToHex(newHsb),
                                          );
                                        }}
                                      />
                                    </Box>
                                  </Popover>
                                </InlineStack>
                              </BlockStack>
                            );
                          }
                          return null;
                        })}
                      </FormLayout>
                    </BlockStack>
                  )}

                <InlineStack>
                  <Button
                    loading={testGenRunning}
                    disabled={testGenRunning}
                    onClick={() => testFileInputRef.current?.click()}
                  >
                    Elegir foto y generar
                  </Button>
                  <input
                    ref={testFileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleRunTestGeneration}
                  />
                </InlineStack>
              </BlockStack>
            </Card>

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
                            <button
                              type="button"
                              onClick={() => openViewer(img)}
                              aria-label={`Ver imagen ${img.orderIndex} en pantalla completa`}
                              style={{
                                background: "none",
                                border: 0,
                                padding: 0,
                                cursor: "pointer",
                                display: "block",
                              }}
                            >
                              <Thumbnail
                                source={img.imageUrl}
                                alt={img.altImage ?? `Imagen ${img.orderIndex}`}
                                size="large"
                              />
                            </button>
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

            {/* Prompt Template */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingSm" as="h2">
                  Prompt Template
                </Text>
                <FormLayout>
                  <TextField
                    label="prompt_template"
                    value={promptTemplate}
                    onChange={setPromptTemplate}
                    multiline={12}
                    autoComplete="off"
                    monospaced
                    helpText="Prompt completo al VLM. Placeholders: {{petName}}, {{petSpecies}}, {{petBreed}}, {{maxPets}} y los de template_vars."
                  />

                  <TextField
                    label="template_vars (JSON)"
                    value={templateVarsText}
                    onChange={setTemplateVarsText}
                    multiline={6}
                    autoComplete="off"
                    monospaced
                    helpText="Variables custom para sustituir {{placeholders}} en prompt_template"
                  />
                </FormLayout>

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={handleSavePrompt}
                  >
                    Guardar cambios
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Opciones seleccionables por el usuario */}
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text variant="headingSm" as="h2">
                    Opciones seleccionables por el usuario
                  </Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    Variables que el usuario final podrá ajustar al generar la
                    imagen (select / slider / color). Cada key se sustituye en{" "}
                    <code>prompt_template</code> mediante{" "}
                    <code>{"{{key}}"}</code>.
                  </Text>
                </BlockStack>
                <FormLayout>
                  <TextField
                    label="template_var_options (JSON)"
                    value={templateVarOptionsText}
                    onChange={setTemplateVarOptionsText}
                    multiline={10}
                    autoComplete="off"
                    monospaced
                    placeholder={EXAMPLE_TEMPLATE_VAR_OPTIONS}
                    helpText="Cada key define un control: { type: 'select'|'slider'|'color', label, default, ... }"
                  />
                </FormLayout>

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={handleSaveTemplateVarOptions}
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

      <Modal
        open={viewingImage !== null}
        onClose={closeViewer}
        title={viewingImage?.altImage || `Imagen ${viewingImage?.orderIndex ?? ""}`}
        size="large"
      >
        <Modal.Section>
          <Layout>
            <Layout.Section>
              <Box
                background="bg-surface-inverse"
                borderRadius="200"
                padding="400"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewingImage?.imageUrl}
                    alt={viewingImage?.altImage ?? ""}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </Box>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <BlockStack gap="400">
                <Text variant="headingSm" as="h3">
                  Información
                </Text>

                <BlockStack gap="100">
                  <TextField
                    label="URL"
                    value={viewingImage?.imageUrl ?? ""}
                    readOnly
                    multiline={3}
                    autoComplete="off"
                    connectedRight={
                      <Button
                        icon={ClipboardIcon}
                        onClick={handleCopyUrl}
                        accessibilityLabel="Copiar URL"
                      />
                    }
                  />
                  {copiedUrl && (
                    <Text as="span" tone="success" variant="bodySm">
                      ¡Copiado!
                    </Text>
                  )}
                </BlockStack>

                <TextField
                  label="Alt text"
                  value={viewerAlt}
                  onChange={setViewerAlt}
                  onBlur={handleViewerSaveAlt}
                  placeholder="Descripción de la imagen"
                  autoComplete="off"
                  disabled={imageActionId === viewingImage?.id}
                  helpText="Se guarda al salir del campo"
                />

                <BlockStack gap="200">
                  <ConfigPreviewField
                    label="Subida"
                    value={
                      viewingImage
                        ? new Date(viewingImage.createdAt).toLocaleString("es-ES")
                        : "—"
                    }
                  />
                  <ConfigPreviewField
                    label="Orden"
                    value={String(viewingImage?.orderIndex ?? "—")}
                  />
                  <ConfigPreviewField
                    label="Estado"
                    value={
                      viewingImage?.isPrimary ? (
                        <Badge tone="success">Primaria</Badge>
                      ) : (
                        <Badge tone="enabled">Secundaria</Badge>
                      )
                    }
                  />
                </BlockStack>
              </BlockStack>
            </Layout.Section>
          </Layout>
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
  return (
    <BlockStack gap="300">
      <InlineStack gap="400" wrap>
        <ConfigPreviewField label="Nombre" value={config.name} />
        <ConfigPreviewField label="Modelo" value={config.visionModel ?? "—"} />
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
