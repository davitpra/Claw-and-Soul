import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  Card,
  Banner,
  Button,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Thumbnail,
  Modal,
  TextField,
  Select,
  FormLayout,
  RangeSlider,
  ColorPicker,
  Popover,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import type { AdminStyle, AdminPet } from "@/entities/admin/api";
import { hexToHsb, hsbToHex, type HsbColor } from "@/lib/colorUtils";
import type { TemplateVarOption } from "../templateVars";

// Card "Generar imagen de prueba": selección de mascota/foto, formato, opciones
// del template y disparo de la generación. Incluye el modal de nueva mascota.
export function StyleTestGenerationCard({
  style,
  testGenRunning,
  testGenStatus,
  testGenError,
  setTestGenError,
  testGenSuccess,
  setTestGenSuccess,
  myPets,
  petsLoading,
  selectedPetId,
  setSelectedPetId,
  selectedPhotoId,
  setSelectedPhotoId,
  newPetModalOpen,
  setNewPetModalOpen,
  petPhotoInputRef,
  uploadingPetPhoto,
  onUploadPetPhoto,
  testAspectRatio,
  setTestAspectRatio,
  userSelections,
  updateSelection,
  colorHsbs,
  setColorHsbs,
  colorPopovers,
  setColorPopovers,
  onRunTestGeneration,
  newPetName,
  setNewPetName,
  newPetSpecies,
  setNewPetSpecies,
  newPetBreed,
  setNewPetBreed,
  creatingPet,
  createPetError,
  setCreatePetError,
  onCreatePet,
}: {
  style: AdminStyle;
  testGenRunning: boolean;
  testGenStatus: { status: string | null };
  testGenError: string | null;
  setTestGenError: Dispatch<SetStateAction<string | null>>;
  testGenSuccess: boolean;
  setTestGenSuccess: Dispatch<SetStateAction<boolean>>;
  myPets: AdminPet[];
  petsLoading: boolean;
  selectedPetId: string;
  setSelectedPetId: Dispatch<SetStateAction<string>>;
  selectedPhotoId: string | null;
  setSelectedPhotoId: Dispatch<SetStateAction<string | null>>;
  newPetModalOpen: boolean;
  setNewPetModalOpen: Dispatch<SetStateAction<boolean>>;
  petPhotoInputRef: RefObject<HTMLInputElement | null>;
  uploadingPetPhoto: boolean;
  onUploadPetPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  testAspectRatio: string;
  setTestAspectRatio: Dispatch<SetStateAction<string>>;
  userSelections: Record<string, string | number>;
  updateSelection: (key: string, value: string | number) => void;
  colorHsbs: Record<string, HsbColor>;
  setColorHsbs: Dispatch<SetStateAction<Record<string, HsbColor>>>;
  colorPopovers: Record<string, boolean>;
  setColorPopovers: Dispatch<SetStateAction<Record<string, boolean>>>;
  onRunTestGeneration: () => void;
  newPetName: string;
  setNewPetName: Dispatch<SetStateAction<string>>;
  newPetSpecies: string;
  setNewPetSpecies: Dispatch<SetStateAction<string>>;
  newPetBreed: string;
  setNewPetBreed: Dispatch<SetStateAction<string>>;
  creatingPet: boolean;
  createPetError: string | null;
  setCreatePetError: Dispatch<SetStateAction<string | null>>;
  onCreatePet: () => void;
}) {
  return (
    <>
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
            <Banner tone="critical" onDismiss={() => setTestGenError(null)}>
              {testGenError}
            </Banner>
          )}
          {testGenSuccess && (
            <Banner tone="success" onDismiss={() => setTestGenSuccess(false)}>
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
                No tenés mascotas guardadas. Creá una para reutilizar fotos.
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
                            cursor: testGenRunning ? "not-allowed" : "pointer",
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
                          opacity: testGenRunning || uploadingPetPhoto ? 0.5 : 1,
                        }}
                      >
                        {uploadingPetPhoto ? (
                          <Spinner size="small" />
                        ) : (
                          <>
                            <Text as="span" variant="bodyXs" tone="subdued">
                              + Subir
                            </Text>
                            <Text as="span" variant="bodyXs" tone="subdued">
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
            onChange={onUploadPetPhoto}
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
                              : [{ label: "— sin selección —", value: "" }]),
                            ...opt.options.map((o) => ({
                              label: o.label,
                              value: o.value,
                            })),
                          ]}
                          value={String(userSelections[key] ?? opt.default ?? "")}
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
                          value={Number(userSelections[key] ?? opt.default)}
                          min={opt.min}
                          max={opt.max}
                          step={opt.step ?? 1}
                          output
                          onChange={(v) => updateSelection(key, Number(v))}
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
                                    updateSelection(key, hsbToHex(newHsb));
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
              onClick={onRunTestGeneration}
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
          onAction: onCreatePet,
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
            {createPetError && <Banner tone="critical">{createPetError}</Banner>}
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
    </>
  );
}
