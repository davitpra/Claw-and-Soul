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
  Modal,
  TextField,
  Select,
  FormLayout,
} from "@shopify/polaris";
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
  arrayMove,
} from "@dnd-kit/sortable";
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
import { hexToHsb, type HsbColor } from "@/lib/colorUtils";
import {
  UNASSIGNED,
  type TemplateVarOption,
  EXAMPLE_TEMPLATE_VARS,
  EXAMPLE_TEMPLATE_VAR_OPTIONS,
  validateTemplateVarOptions,
} from "./templateVars";
import { StyleTestGenerationCard } from "./_components/StyleTestGenerationCard";
import { StyleImageViewerModal } from "./_components/StyleImageViewerModal";
import { SortableImageTile, UploadTile } from "./_components/StyleImageTiles";

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
        difficulty: style.difficulty,
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

            <StyleTestGenerationCard
              style={style}
              testGenRunning={testGenRunning}
              testGenStatus={testGenStatus}
              testGenError={testGenError}
              setTestGenError={setTestGenError}
              testGenSuccess={testGenSuccess}
              setTestGenSuccess={setTestGenSuccess}
              myPets={myPets}
              petsLoading={petsLoading}
              selectedPetId={selectedPetId}
              setSelectedPetId={setSelectedPetId}
              selectedPhotoId={selectedPhotoId}
              setSelectedPhotoId={setSelectedPhotoId}
              newPetModalOpen={newPetModalOpen}
              setNewPetModalOpen={setNewPetModalOpen}
              petPhotoInputRef={petPhotoInputRef}
              uploadingPetPhoto={uploadingPetPhoto}
              onUploadPetPhoto={handleUploadPetPhoto}
              testAspectRatio={testAspectRatio}
              setTestAspectRatio={setTestAspectRatio}
              userSelections={userSelections}
              updateSelection={updateSelection}
              colorHsbs={colorHsbs}
              setColorHsbs={setColorHsbs}
              colorPopovers={colorPopovers}
              setColorPopovers={setColorPopovers}
              onRunTestGeneration={handleRunTestGeneration}
              newPetName={newPetName}
              setNewPetName={setNewPetName}
              newPetSpecies={newPetSpecies}
              setNewPetSpecies={setNewPetSpecies}
              newPetBreed={newPetBreed}
              setNewPetBreed={setNewPetBreed}
              creatingPet={creatingPet}
              createPetError={createPetError}
              setCreatePetError={setCreatePetError}
              onCreatePet={handleCreatePet}
            />

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
                  {/* anade un select de dificultad: easy, medium, challenging */}
                  <Select
                    label="Dificultad"
                    options={[
                      { label: "Fácil", value: "easy" },
                      { label: "Media", value: "medium" },
                      { label: "Difícil", value: "challenging" },
                    ]}
                    value={style.difficulty ?? "medium"}
                    onChange={(v) => {
                      setStyle((prev) =>
                        prev
                          ? {
                              ...prev,
                              difficulty: v as AdminStyle["difficulty"],
                            }
                          : prev,
                      );
                    }}
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

      <StyleImageViewerModal
        viewingImage={viewingImage}
        onClose={closeViewer}
        viewerAlt={viewerAlt}
        onViewerAltChange={setViewerAlt}
        onViewerSaveAlt={handleViewerSaveAlt}
        onCopyUrl={handleCopyUrl}
        copiedUrl={copiedUrl}
        imageActionId={imageActionId}
        imageGeneration={imageGeneration}
        imageGenerationLoading={imageGenerationLoading}
        imageGenerationError={imageGenerationError}
        imageGenerationNotFound={imageGenerationNotFound}
        onCopyFinalPrompt={handleCopyFinalPrompt}
        copiedFinalPrompt={copiedFinalPrompt}
        metadataOpen={metadataOpen}
        onToggleMetadata={() => setMetadataOpen((prev) => !prev)}
      />
    </Page>
  );
}
