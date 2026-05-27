"use client";

import { useEffect, useRef, useState } from "react";
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
  Thumbnail,
  Modal,
  TextField,
  Select,
  FormLayout,
  RangeSlider,
  ColorPicker,
  Popover,
  Collapsible,
} from "@shopify/polaris";
import { DeleteIcon, ClipboardIcon, PlusIcon } from "@shopify/polaris-icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  adminApi,
  AdminStyle,
  AdminStyleImage,
  AdminImageGeneration,
  AdminVisionConfig,
  AdminImageGenConfig,
  AdminPet,
} from "@/entities/admin/api";
import { useAdminGenerationStatus } from "@/hooks/useAdminGenerationStatus";
import { hexToHsb, hsbToHex, type HsbColor } from "@/lib/colorUtils";

const UNASSIGNED = "";

type TemplateVarOption =
  | {
      type: "select";
      label: string;
      options: { value: string; label: string }[];
      default: string;
      required?: boolean;
    }
  | {
      type: "slider";
      label: string;
      min: number;
      max: number;
      step?: number;
      default: number;
    }
  | { type: "color"; label: string; default: string };

const EXAMPLE_TEMPLATE_VARS = `{
  "colorCount": 5
  }`;

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
  const router = useRouter();

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
  const [duplicating, setDuplicating] = useState(false);

  // Sidebar form state
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");
  const [thanksUrl, setThanksUrl] = useState("");
  const [thanksUrlImgError, setThanksUrlImgError] = useState(false);

  // Pipeline form state
  const [strategyKey, setStrategyKey] = useState("");
  const [strategyKeys, setStrategyKeys] = useState<string[]>([]);
  const [visionConfigId, setVisionConfigId] = useState<string>(UNASSIGNED);
  const [imageGenConfigId, setImageGenConfigId] = useState<string>(UNASSIGNED);

  // Prompt template form state
  const [promptTemplate, setPromptTemplate] = useState("");
  const [templateVarsText, setTemplateVarsText] = useState("");
  const [templateVarOptionsText, setTemplateVarOptionsText] = useState("");
  const [jsonPromptError, setJsonPromptError] = useState<string | null>(null);
  const [jsonOptionsError, setJsonOptionsError] = useState<string | null>(null);

  // Reference image state (style-transfer strategy)
  const [uploadingRefImage, setUploadingRefImage] = useState(false);
  const [removingRefImage, setRemovingRefImage] = useState(false);
  const refImageInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<AdminStyleImage | null>(
    null,
  );
  const [reorderingImages, setReorderingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<AdminStyleImage | null>(
    null,
  );
  const [viewerAlt, setViewerAlt] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imageGeneration, setImageGeneration] =
    useState<AdminImageGeneration | null>(null);
  const [imageGenerationLoading, setImageGenerationLoading] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<
    string | null
  >(null);
  const [imageGenerationNotFound, setImageGenerationNotFound] = useState(false);
  const [copiedFinalPrompt, setCopiedFinalPrompt] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);

  // Test generation state
  const [testGenId, setTestGenId] = useState<string | null>(null);
  const [testGenRunning, setTestGenRunning] = useState(false);
  const [testGenError, setTestGenError] = useState<string | null>(null);
  const [testGenSuccess, setTestGenSuccess] = useState(false);
  const [testAspectRatio, setTestAspectRatio] = useState("4:5");
  const [userSelections, setUserSelections] = useState<
    Record<string, string | number>
  >({});
  const [colorHsbs, setColorHsbs] = useState<Record<string, HsbColor>>({});
  const [colorPopovers, setColorPopovers] = useState<Record<string, boolean>>(
    {},
  );
  // Pet gallery state
  const [myPets, setMyPets] = useState<AdminPet[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [newPetModalOpen, setNewPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetSpecies, setNewPetSpecies] = useState("dog");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [creatingPet, setCreatingPet] = useState(false);
  const [createPetError, setCreatePetError] = useState<string | null>(null);
  const [uploadingPetPhoto, setUploadingPetPhoto] = useState(false);
  const petPhotoInputRef = useRef<HTMLInputElement>(null);

  const testGenStatus = useAdminGenerationStatus(testGenId);

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const hydrateForm = (s: AdminStyle) => {
    setName(s.name);
    setNameError(null);
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
  };

  useEffect(() => {
    Promise.all([
      adminApi.styles.getById(id),
      adminApi.visionConfigs.list(),
      adminApi.imageGenConfigs.list(),
      adminApi.strategies.list(),
    ])
      .then(([s, vc, igc, sk]) => {
        setStyle(s);
        setVisionConfigs(vc);
        setImageGenConfigs(igc);
        setStrategyKeys(sk);
        hydrateForm(s);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const loadPets = async () => {
    setPetsLoading(true);
    try {
      const pets = await adminApi.pets.list();
      setMyPets(pets);
      setSelectedPetId((prev) => (prev ? prev : (pets[0]?.id ?? "")));
    } catch {
      // silent — pets not critical to page load
    } finally {
      setPetsLoading(false);
    }
  };

  useEffect(() => {
    void loadPets();
  }, []);

  useEffect(() => {
    if (!style?.templateVarOptions) return;
    setUserSelections((prev) => {
      const next = { ...prev };
      const newHsbs: Record<string, HsbColor> = {};
      for (const [key, raw] of Object.entries(
        style.templateVarOptions as Record<string, unknown>,
      )) {
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

  const handleRunTestGeneration = async () => {
    if (!style || !selectedPhotoId) return;
    setTestGenError(null);
    setTestGenSuccess(false);
    setTestGenRunning(true);
    try {
      const result = await adminApi.styles.runTestGeneration(style.id, {
        petPhotoId: selectedPhotoId,
        aspectRatio: testAspectRatio || undefined,
        userSelections,
      });
      setTestGenId(result.generationId);
    } catch (err: unknown) {
      setTestGenRunning(false);
      setTestGenError((err as Error).message);
    }
  };

  const handleUploadPetPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPetId) return;
    e.target.value = "";
    setUploadingPetPhoto(true);
    try {
      const photo = await adminApi.pets.uploadPhoto(selectedPetId, file);
      setMyPets((prev) =>
        prev.map((p) =>
          p.id === selectedPetId ? { ...p, photos: [...p.photos, photo] } : p,
        ),
      );
      setSelectedPhotoId(photo.id);
    } catch (err: unknown) {
      setTestGenError((err as Error).message);
    } finally {
      setUploadingPetPhoto(false);
    }
  };

  const handleCreatePet = async () => {
    if (!newPetName.trim()) return;
    setCreatingPet(true);
    setCreatePetError(null);
    try {
      const pet = await adminApi.pets.create({
        name: newPetName.trim(),
        species: newPetSpecies,
        breed: newPetBreed.trim() || undefined,
      });
      setMyPets((prev) => [pet, ...prev]);
      setSelectedPetId(pet.id);
      setSelectedPhotoId(null);
      setNewPetModalOpen(false);
      setNewPetName("");
      setNewPetBreed("");
      setNewPetSpecies("dog");
    } catch (err: unknown) {
      setCreatePetError((err as Error).message);
    } finally {
      setCreatingPet(false);
    }
  };

  const handleSaveBasics = async () => {
    if (!style) return;
    setSaveError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Requerido");
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(trimmedName)) {
      setNameError("Solo minúsculas, números, '-' y '_'");
      return;
    }
    if (trimmedName.length > 100) {
      setNameError("Máximo 100 caracteres");
      return;
    }

    if (trimmedName !== style.name) {
      const all = await adminApi.styles.list();
      const duplicate = all.find(
        (s) => s.name === trimmedName && s.id !== style.id,
      );
      if (duplicate) {
        setNameError("Ya existe un estilo con ese slug");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        name: trimmedName !== style.name ? trimmedName : undefined,
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
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        promptTemplate,
      });
      setStyle(updated);
      hydrateForm(updated);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplateVars = async () => {
    if (!style) return;
    setJsonPromptError(null);
    setJsonOptionsError(null);
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

    let parsedOptions: Record<string, unknown> | null = null;
    if (templateVarOptionsText.trim()) {
      try {
        parsedOptions = JSON.parse(templateVarOptionsText);
      } catch {
        setJsonOptionsError("template_var_options: JSON inválido");
        return;
      }
      const validationError = validateTemplateVarOptions(parsedOptions);
      if (validationError) {
        setJsonOptionsError(`template_var_options: ${validationError}`);
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await adminApi.styles.update(style.id, {
        templateVars: parsedTemplateVars,
        templateVarOptions: parsedOptions,
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

  const handleDuplicate = async () => {
    if (!style) return;
    setDuplicating(true);
    setSaveError(null);
    try {
      const all = await adminApi.styles.list();
      const taken = new Set(all.map((s) => s.name));
      const base = `${style.name}-copia`;
      let candidate = base;
      let n = 2;
      while (taken.has(candidate)) {
        candidate = `${base}-${n}`;
        n++;
      }
      const created = await adminApi.styles.create({
        name: candidate,
        displayName: `${style.displayName} (copia)`,
        category: style.category,
        thanksUrl: style.thanksUrl ?? undefined,
        strategyKey: style.strategyKey ?? undefined,
        promptTemplate: style.promptTemplate ?? undefined,
        templateVars: style.templateVars ?? undefined,
        templateVarOptions: style.templateVarOptions ?? undefined,
        visionConfigId: style.visionConfigId ?? undefined,
        imageGenConfigId: style.imageGenConfigId ?? undefined,
        isActive: false,
      });
      router.push(`/admin/styles/${created.id}`);
    } catch (e: unknown) {
      setSaveError((e as Error).message ?? "Error al duplicar el estilo");
      setDuplicating(false);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!style) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = style.images.findIndex((img) => img.id === active.id);
    const newIndex = style.images.findIndex((img) => img.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const prevImages = style.images;
    const reordered = arrayMove(prevImages, oldIndex, newIndex).map(
      (img, i) => ({ ...img, orderIndex: i, isPrimary: i === 0 }),
    );

    setStyle((prev) => (prev ? { ...prev, images: reordered } : prev));
    setReorderingImages(true);

    try {
      const styleId = style.id;
      const newPrimary = reordered[0];
      const prevPrimary = prevImages[0];

      if (newPrimary?.id && newPrimary.id !== prevPrimary?.id) {
        await adminApi.styles.updateImage(styleId, newPrimary.id, {
          isPrimary: true,
          orderIndex: 0,
        });
      }

      await Promise.all(
        reordered
          .filter((img, i) => {
            if (!img.id) return false;
            if (img.id === newPrimary?.id) return false;
            const prev = prevImages.find((p) => p.id === img.id);
            return !!prev && prev.orderIndex !== i;
          })
          .map((img) =>
            adminApi.styles.updateImage(styleId, img.id, {
              orderIndex: img.orderIndex,
            }),
          ),
      );

      await reload();
    } catch (err: unknown) {
      setSaveError((err as Error).message);
      await reload();
    } finally {
      setReorderingImages(false);
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

  useEffect(() => {
    if (!viewingImage) {
      setImageGeneration(null);
      setImageGenerationError(null);
      setImageGenerationNotFound(false);
      setMetadataOpen(false);
      return;
    }
    let cancelled = false;
    setImageGeneration(null);
    setImageGenerationError(null);
    setImageGenerationNotFound(false);
    setImageGenerationLoading(true);
    adminApi.styles
      .getImageGeneration(viewingImage.styleId, viewingImage.id)
      .then((res) => {
        if (cancelled) return;
        setImageGenerationNotFound(res.generation === null);
        setImageGeneration(res.generation);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setImageGenerationError(
          (err as Error).message ?? "Error al cargar generación",
        );
      })
      .finally(() => {
        if (!cancelled) setImageGenerationLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingImage?.id]);

  const handleViewerSaveAlt = async () => {
    if (!viewingImage) return;
    if (viewerAlt === (viewingImage.altImage ?? "")) return;
    await handleSaveAlt(viewingImage, viewerAlt);
    setViewingImage((prev) => (prev ? { ...prev, altImage: viewerAlt } : prev));
  };

  const handleCopyUrl = async () => {
    if (!viewingImage) return;
    await navigator.clipboard.writeText(viewingImage.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const handleCopyFinalPrompt = async () => {
    const text = imageGeneration?.finalPrompt ?? imageGeneration?.prompt ?? "";
    await navigator.clipboard.writeText(text);
    setCopiedFinalPrompt(true);
    setTimeout(() => setCopiedFinalPrompt(false), 1500);
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

  const strategyOptions = [
    ...strategyKeys.map((k) => ({ label: k, value: k })),
    ...(strategyKey && !strategyKeys.includes(strategyKey)
      ? [{ label: `${strategyKey} (no registrada)`, value: strategyKey }]
      : []),
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
          content: "Duplicar",
          loading: duplicating,
          disabled: toggling,
          onAction: handleDuplicate,
        },
        {
          content: style.isActive ? "Desactivar" : "Activar",
          loading: toggling,
          disabled: duplicating,
          onAction: handleToggle,
        },
      ]}
    >
      <Layout>
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

                {/* Selección de mascota */}
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingXs" as="h3">
                      Mascota
                    </Text>
                    <Button
                      size="slim"
                      icon={PlusIcon}
                      onClick={() => setNewPetModalOpen(true)}
                      disabled={testGenRunning}
                    >
                      Nueva mascota
                    </Button>
                  </InlineStack>

                  {petsLoading ? (
                    <InlineStack gap="200" blockAlign="center">
                      <Spinner size="small" />
                      <Text as="span" tone="subdued">
                        Cargando mascotas…
                      </Text>
                    </InlineStack>
                  ) : myPets.length === 0 ? (
                    <Text as="p" tone="subdued">
                      No tenés mascotas guardadas. Creá una para reutilizar
                      fotos.
                    </Text>
                  ) : (
                    <Select
                      label="Seleccionar mascota"
                      options={myPets.map((p) => ({
                        label: `${p.name} (${p.species}${p.breed ? ` · ${p.breed}` : ""})`,
                        value: p.id,
                      }))}
                      value={selectedPetId}
                      onChange={(v) => {
                        setSelectedPetId(v);
                        setSelectedPhotoId(null);
                      }}
                      disabled={testGenRunning}
                    />
                  )}

                  {/* Grid de fotos de la mascota seleccionada */}
                  {selectedPetId &&
                    (() => {
                      const pet = myPets.find((p) => p.id === selectedPetId);
                      if (!pet) return null;
                      return (
                        <BlockStack gap="200">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Seleccioná una foto para usar en la generación
                          </Text>
                          <InlineStack gap="200" wrap>
                            {pet.photos.map((photo) => (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => setSelectedPhotoId(photo.id)}
                                disabled={testGenRunning}
                                style={{
                                  padding: 0,
                                  border:
                                    selectedPhotoId === photo.id
                                      ? "3px solid #448da6"
                                      : "3px solid transparent",
                                  borderRadius: 8,
                                  cursor: testGenRunning
                                    ? "not-allowed"
                                    : "pointer",
                                  background: "none",
                                  opacity: testGenRunning ? 0.6 : 1,
                                  lineHeight: 0,
                                }}
                              >
                                <Thumbnail
                                  source={photo.photoUrl}
                                  alt={pet.name}
                                  size="large"
                                />
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => petPhotoInputRef.current?.click()}
                              disabled={testGenRunning || uploadingPetPhoto}
                              style={{
                                width: 80,
                                height: 80,
                                border: "2px dashed #ccc",
                                borderRadius: 8,
                                cursor:
                                  testGenRunning || uploadingPetPhoto
                                    ? "not-allowed"
                                    : "pointer",
                                background: "#fafafa",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                opacity:
                                  testGenRunning || uploadingPetPhoto ? 0.5 : 1,
                              }}
                            >
                              {uploadingPetPhoto ? (
                                <Spinner size="small" />
                              ) : (
                                <>
                                  <Text
                                    as="span"
                                    variant="bodyXs"
                                    tone="subdued"
                                  >
                                    + Subir
                                  </Text>
                                  <Text
                                    as="span"
                                    variant="bodyXs"
                                    tone="subdued"
                                  >
                                    foto
                                  </Text>
                                </>
                              )}
                            </button>
                          </InlineStack>
                          {selectedPhotoId && (
                            <Text as="p" variant="bodySm" tone="success">
                              Foto seleccionada ✓
                            </Text>
                          )}
                        </BlockStack>
                      );
                    })()}
                </BlockStack>

                <input
                  ref={petPhotoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleUploadPetPhoto}
                />

                <Text variant="headingXs" as="h3">
                  Formato de imagen
                </Text>

                <FormLayout>
                  <FormLayout.Group>
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
                            const hsb = colorHsbs[key] ?? hexToHsb(currentHex);
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
                    variant="primary"
                    loading={testGenRunning}
                    disabled={testGenRunning || !selectedPhotoId}
                    onClick={handleRunTestGeneration}
                  >
                    Generar imagen
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Modal nueva mascota */}
            <Modal
              open={newPetModalOpen}
              onClose={() => {
                setNewPetModalOpen(false);
                setCreatePetError(null);
                setNewPetName("");
                setNewPetBreed("");
                setNewPetSpecies("dog");
              }}
              title="Nueva mascota"
              primaryAction={{
                content: "Crear mascota",
                onAction: handleCreatePet,
                loading: creatingPet,
                disabled: !newPetName.trim() || creatingPet,
              }}
              secondaryActions={[
                {
                  content: "Cancelar",
                  onAction: () => setNewPetModalOpen(false),
                },
              ]}
            >
              <Modal.Section>
                <BlockStack gap="400">
                  {createPetError && (
                    <Banner tone="critical">{createPetError}</Banner>
                  )}
                  <FormLayout>
                    <TextField
                      label="Nombre"
                      value={newPetName}
                      onChange={setNewPetName}
                      autoComplete="off"
                      disabled={creatingPet}
                    />
                    <Select
                      label="Especie"
                      options={[
                        { label: "Perro", value: "dog" },
                        { label: "Gato", value: "cat" },
                        { label: "Ave", value: "bird" },
                        { label: "Conejo", value: "rabbit" },
                        { label: "Otro", value: "other" },
                      ]}
                      value={newPetSpecies}
                      onChange={setNewPetSpecies}
                      disabled={creatingPet}
                    />
                    <TextField
                      label="Raza (opcional)"
                      value={newPetBreed}
                      onChange={setNewPetBreed}
                      autoComplete="off"
                      disabled={creatingPet}
                    />
                  </FormLayout>
                </BlockStack>
              </Modal.Section>
            </Modal>

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
                  {(uploadingImage || reorderingImages) && (
                    <Spinner size="small" />
                  )}
                </InlineStack>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                />

                {style.images.length === 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 8,
                    }}
                  >
                    <UploadTile
                      uploading={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                    />
                  </div>
                ) : (
                  <DndContext
                    sensors={dndSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={style.images.map((i) => i.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(5, 1fr)",
                          gap: 8,
                        }}
                      >
                        {style.images.map((img, idx) => (
                          <SortableImageTile
                            key={img.id}
                            img={img}
                            isPrimary={idx === 0}
                            isLoading={
                              imageActionId === img.id || reorderingImages
                            }
                            onView={() => openViewer(img)}
                            onDelete={() => setDeletingImage(img)}
                          />
                        ))}
                        <UploadTile
                          uploading={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                        />
                      </div>
                    </SortableContext>
                  </DndContext>
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
                    Opciones de usuario
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
                    label="template_vars (JSON)"
                    value={templateVarsText}
                    onChange={setTemplateVarsText}
                    multiline={6}
                    autoComplete="off"
                    monospaced
                    placeholder={EXAMPLE_TEMPLATE_VARS}
                    helpText=" Posibles Variables custom"
                  />
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
                    onClick={handleSaveTemplateVars}
                  >
                    Guardar cambios
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
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
                    label="Slug"
                    value={name}
                    onChange={(v) => {
                      setName(v);
                      setNameError(null);
                    }}
                    autoComplete="off"
                    error={nameError ?? undefined}
                    maxLength={100}
                    helpText="Solo minúsculas, números, '-' y '_'. Ej: watercolor-classic"
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
                <BlockStack gap="200">
                  <Text variant="bodySm" as="p" fontWeight="bold">
                    Imagen de referencia (style-transfer)
                  </Text>
                  {style.styleReferenceUrl ? (
                    <BlockStack gap="200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={style.styleReferenceUrl}
                        alt="Referencia de estilo"
                        style={{
                          maxWidth: 160,
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
                      />
                      <InlineStack gap="200">
                        <Button
                          size="slim"
                          loading={uploadingRefImage}
                          onClick={() => refImageInputRef.current?.click()}
                        >
                          Cambiar
                        </Button>
                        <Button
                          size="slim"
                          tone="critical"
                          loading={removingRefImage}
                          onClick={async () => {
                            setRemovingRefImage(true);
                            try {
                              await adminApi.styles.removeReferenceImage(id);
                              await reload();
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setRemovingRefImage(false);
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  ) : (
                    <Button
                      size="slim"
                      loading={uploadingRefImage}
                      onClick={() => refImageInputRef.current?.click()}
                    >
                      Subir imagen de referencia
                    </Button>
                  )}
                  <Text variant="bodySm" as="p" tone="subdued">
                    Requerida para estrategias de tipo style-transfer. Define el
                    estilo visual, pose y composición.
                  </Text>
                  <input
                    ref={refImageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingRefImage(true);
                      try {
                        await adminApi.styles.uploadReferenceImage(id, file);
                        await reload();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setUploadingRefImage(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </BlockStack>
                <FormLayout>
                  <Select
                    label="strategy_key"
                    options={strategyOptions}
                    value={strategyKey}
                    onChange={setStrategyKey}
                    helpText="Estrategia de pipeline registrada en el backend"
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
        title={
          viewingImage?.altImage || `Imagen ${viewingImage?.orderIndex ?? ""}`
        }
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
                        ? new Date(viewingImage.createdAt).toLocaleString(
                            "es-ES",
                          )
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

                <Divider />

                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    Generación
                  </Text>

                  {imageGenerationLoading && (
                    <Spinner
                      accessibilityLabel="Cargando generación"
                      size="small"
                    />
                  )}

                  {!imageGenerationLoading && imageGenerationError && (
                    <Banner tone="critical">{imageGenerationError}</Banner>
                  )}

                  {!imageGenerationLoading &&
                    !imageGenerationError &&
                    imageGenerationNotFound && (
                      <Banner tone="info">
                        Esta imagen no tiene generación asociada (fue subida
                        manualmente).
                      </Banner>
                    )}

                  {!imageGenerationLoading &&
                    !imageGenerationError &&
                    imageGeneration && (
                      <BlockStack gap="300">
                        <ConfigPreviewField
                          label="Estado"
                          value={
                            <Badge
                              tone={
                                imageGeneration.status === "completed"
                                  ? "success"
                                  : imageGeneration.status === "failed"
                                    ? "critical"
                                    : "attention"
                              }
                            >
                              {imageGeneration.status}
                            </Badge>
                          }
                        />

                        {imageGeneration.processingTimeSeconds !== null && (
                          <ConfigPreviewField
                            label="Tiempo"
                            value={`${imageGeneration.processingTimeSeconds}s`}
                          />
                        )}

                        <ConfigPreviewField
                          label="Proveedor"
                          value={
                            imageGeneration.falRequestId
                              ? `${imageGeneration.provider} · ${imageGeneration.falRequestId}`
                              : imageGeneration.provider
                          }
                        />

                        {imageGeneration.metadata &&
                          typeof imageGeneration.metadata === "object" && (
                            <>
                              {(
                                imageGeneration.metadata as Record<
                                  string,
                                  unknown
                                >
                              ).petContext && (
                                <ConfigPreviewField
                                  label="Contexto de mascota"
                                  value={(() => {
                                    const pc = (
                                      imageGeneration.metadata as Record<
                                        string,
                                        unknown
                                      >
                                    ).petContext as Record<string, string>;
                                    return [
                                      pc.petName,
                                      pc.petSpecies,
                                      pc.petBreed,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ");
                                  })()}
                                />
                              )}

                              {(
                                imageGeneration.metadata as Record<
                                  string,
                                  unknown
                                >
                              ).inputPhotoUrl && (
                                <ConfigPreviewField
                                  label="Foto de entrada"
                                  value={
                                    <a
                                      href={
                                        (
                                          imageGeneration.metadata as Record<
                                            string,
                                            unknown
                                          >
                                        ).inputPhotoUrl as string
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Ver foto
                                    </a>
                                  }
                                />
                              )}

                              {(
                                imageGeneration.metadata as Record<
                                  string,
                                  unknown
                                >
                              ).compatConstraints &&
                                typeof (
                                  imageGeneration.metadata as Record<
                                    string,
                                    unknown
                                  >
                                ).compatConstraints === "object" && (
                                  <ConfigPreviewField
                                    label="Aspect ratio"
                                    value={String(
                                      (
                                        (
                                          imageGeneration.metadata as Record<
                                            string,
                                            unknown
                                          >
                                        ).compatConstraints as Record<
                                          string,
                                          unknown
                                        >
                                      ).aspectRatio ?? "—",
                                    )}
                                  />
                                )}
                            </>
                          )}

                        <BlockStack gap="100">
                          <TextField
                            label={
                              imageGeneration.finalPrompt
                                ? "Final prompt"
                                : "Prompt (plantilla original)"
                            }
                            value={
                              imageGeneration.finalPrompt ??
                              imageGeneration.prompt
                            }
                            readOnly
                            multiline={6}
                            autoComplete="off"
                            helpText={
                              !imageGeneration.finalPrompt
                                ? "La generación no guardó el prompt final procesado"
                                : undefined
                            }
                            connectedRight={
                              <Button
                                icon={ClipboardIcon}
                                onClick={handleCopyFinalPrompt}
                                accessibilityLabel="Copiar prompt"
                              />
                            }
                          />
                          {copiedFinalPrompt && (
                            <Text as="span" tone="success" variant="bodySm">
                              ¡Copiado!
                            </Text>
                          )}
                        </BlockStack>

                        {imageGeneration.metadata && (
                          <BlockStack gap="100">
                            <Button
                              variant="plain"
                              disclosure={metadataOpen ? "up" : "down"}
                              onClick={() => setMetadataOpen((prev) => !prev)}
                            >
                              Ver metadata completa (JSON)
                            </Button>
                            <Collapsible
                              open={metadataOpen}
                              id="image-generation-metadata"
                            >
                              <Box
                                background="bg-surface-secondary"
                                padding="300"
                                borderRadius="200"
                              >
                                <pre
                                  style={{
                                    fontSize: 12,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    maxHeight: 300,
                                    overflowY: "auto",
                                    margin: 0,
                                  }}
                                >
                                  {JSON.stringify(
                                    imageGeneration.metadata,
                                    null,
                                    2,
                                  )}
                                </pre>
                              </Box>
                            </Collapsible>
                          </BlockStack>
                        )}
                      </BlockStack>
                    )}
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

function SortableImageTile({
  img,
  isPrimary,
  isLoading,
  onView,
  onDelete,
}: {
  img: AdminStyleImage;
  isPrimary: boolean;
  isLoading: boolean;
  onView: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const tileStyle: React.CSSProperties = {
    gridColumn: isPrimary ? "span 2" : "span 1",
    gridRow: isPrimary ? "span 2" : "span 1",
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid var(--p-color-border)",
    aspectRatio: "1 / 1",
    cursor: "grab",
    background: "var(--p-color-bg-surface)",
  };

  return (
    <div ref={setNodeRef} style={tileStyle} {...attributes} {...listeners}>
      <button
        type="button"
        onClick={onView}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Ver imagen ${img.orderIndex}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.imageUrl}
          alt={img.altImage ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <Spinner size="small" />
        </div>
      )}

      <button
        type="button"
        aria-label="Eliminar imagen"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid var(--p-color-border)",
          borderRadius: 6,
          padding: "4px 6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
        }}
      >
        <DeleteIcon width={16} height={16} />
      </button>
    </div>
  );
}

function UploadTile({
  uploading,
  onClick,
}: {
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      style={{
        aspectRatio: "1 / 1",
        border: "1px dashed var(--p-color-border)",
        borderRadius: 8,
        background: "var(--p-color-bg-surface-secondary)",
        cursor: uploading ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: uploading ? 0.6 : 1,
        flexDirection: "column",
        gap: 4,
      }}
    >
      {uploading ? (
        <Spinner size="small" />
      ) : (
        <PlusIcon width={24} height={24} />
      )}
    </button>
  );
}
