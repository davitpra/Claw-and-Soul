import {
  Modal,
  Layout,
  Box,
  BlockStack,
  Text,
  TextField,
  Button,
  Badge,
  Banner,
  Spinner,
  Divider,
  Collapsible,
} from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import type {
  AdminStyleImage,
  AdminImageGeneration,
} from "@/entities/admin/api";
import { ConfigPreviewField } from "./ConfigPreviewField";

// Visor de una imagen de la galería: previsualización grande + metadata y datos
// de la generación que la produjo (si existe).
export function StyleImageViewerModal({
  viewingImage,
  onClose,
  viewerAlt,
  onViewerAltChange,
  onViewerSaveAlt,
  onCopyUrl,
  copiedUrl,
  imageActionId,
  imageGeneration,
  imageGenerationLoading,
  imageGenerationError,
  imageGenerationNotFound,
  onCopyFinalPrompt,
  copiedFinalPrompt,
  metadataOpen,
  onToggleMetadata,
}: {
  viewingImage: AdminStyleImage | null;
  onClose: () => void;
  viewerAlt: string;
  onViewerAltChange: (value: string) => void;
  onViewerSaveAlt: () => void;
  onCopyUrl: () => void;
  copiedUrl: boolean;
  imageActionId: string | null;
  imageGeneration: AdminImageGeneration | null;
  imageGenerationLoading: boolean;
  imageGenerationError: string | null;
  imageGenerationNotFound: boolean;
  onCopyFinalPrompt: () => void;
  copiedFinalPrompt: boolean;
  metadataOpen: boolean;
  onToggleMetadata: () => void;
}) {
  return (
    <Modal
      open={viewingImage !== null}
      onClose={onClose}
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
                      onClick={onCopyUrl}
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
                onChange={onViewerAltChange}
                onBlur={onViewerSaveAlt}
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
                                  return [pc.petName, pc.petSpecies, pc.petBreed]
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
                            imageGeneration.finalPrompt ?? imageGeneration.prompt
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
                              onClick={onCopyFinalPrompt}
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
                            onClick={onToggleMetadata}
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
  );
}
