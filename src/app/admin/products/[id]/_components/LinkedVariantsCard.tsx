"use client";

import { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Select,
  IndexTable,
} from "@shopify/polaris";
import { ViewIcon } from "@shopify/polaris-icons";
import {
  adminApi,
  AdminProduct,
  AdminFormat,
  AdminProductVariants,
  AdminProductUnlinkedVariant,
  AdminProductVariantLink,
} from "@/entities/admin/api";

type LinkedVariantsCardProps = {
  product: AdminProduct;
  variants: AdminProductVariants | null;
  formats: AdminFormat[];
  fulfillmentMethod: "in_house" | "pod";
  loadingVariants: boolean;
  onChanged: () => void;
  onOpenPodConfig: (v: AdminProductVariantLink) => void;
  onManageFormats: () => void;
  onError: (message: string) => void;
};

export function LinkedVariantsCard({
  product,
  variants,
  formats,
  fulfillmentMethod,
  loadingVariants,
  onChanged,
  onOpenPodConfig,
  onManageFormats,
  onError,
}: LinkedVariantsCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>(
    {},
  );
  const [linkingVariantId, setLinkingVariantId] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editFormatId, setEditFormatId] = useState<Record<string, string>>({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [togglingVariantId, setTogglingVariantId] = useState<string | null>(
    null,
  );

  const handleLinkVariant = async (u: AdminProductUnlinkedVariant) => {
    const formatId = selectedFormat[u.shopifyVariantId];
    if (!formatId) return;
    setLinkingVariantId(u.shopifyVariantId);
    try {
      await adminApi.products.linkVariant(product.id, {
        shopifyVariantId: u.shopifyVariantId,
        shopifyVariantTitle: u.shopifyVariantTitle,
        formatId,
        shopifyVariantOption: u.shopifyVariantOption ?? undefined,
      });
      onChanged();
    } catch (e: unknown) {
      onError((e as Error).message);
    } finally {
      setLinkingVariantId(null);
    }
  };

  const handleStartEdit = (v: {
    shopifyVariantId: string;
    format: { id: string };
  }) => {
    setEditingVariantId(v.shopifyVariantId);
    setEditFormatId((prev) => ({ ...prev, [v.shopifyVariantId]: v.format.id }));
  };

  const handleCancelEdit = () => setEditingVariantId(null);

  const handleSaveVariant = async (v: {
    shopifyVariantId: string;
    format: { id: string };
  }) => {
    const chosenFormatId = editFormatId[v.shopifyVariantId];
    if (chosenFormatId === v.format.id) {
      setEditingVariantId(null);
      return;
    }
    setSavingVariantId(v.shopifyVariantId);
    try {
      await adminApi.products.updateVariant(product.id, v.shopifyVariantId, {
        formatId: chosenFormatId,
      });
      onChanged();
      setEditingVariantId(null);
    } catch (e: unknown) {
      onError((e as Error).message);
    } finally {
      setSavingVariantId(null);
    }
  };

  const handleToggleVariantActive = async (v: {
    shopifyVariantId: string;
    isActive: boolean;
  }) => {
    setTogglingVariantId(v.shopifyVariantId);
    try {
      await adminApi.products.updateVariant(product.id, v.shopifyVariantId, {
        isActive: !v.isActive,
      });
      onChanged();
    } catch (e: unknown) {
      onError((e as Error).message);
    } finally {
      setTogglingVariantId(null);
    }
  };

  return (
    <Card padding="0">
      <Box padding="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text variant="headingSm" as="h2">
              Variantes / Formatos
            </Text>
            {variants && (
              <Badge tone="info">
                {String(variants.linkedVariants.length)}
              </Badge>
            )}
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            {loadingVariants && <Spinner size="small" />}
            <Button
              variant="plain"
              size="slim"
              icon={ViewIcon}
              onClick={onManageFormats}
            >
              Ver formatos
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>

      {variants && (
        <>
          <IndexTable
            resourceName={{ singular: "variante", plural: "variantes" }}
            itemCount={variants.linkedVariants.length}
            headings={[
              { title: "Formato" },
              { title: "Variante Shopify" },
              { title: "Estado" },
              ...(fulfillmentMethod === "pod"
                ? [{ title: "POD Config" }]
                : []),
              { title: "Acciones" },
            ]}
            selectable={false}
            emptyState={
              <Box padding="400">
                <Text as="p" tone="subdued">
                  Sin variantes vinculadas.
                </Text>
              </Box>
            }
          >
            {variants.linkedVariants.map((v, idx) => {
              const isEditing = editingVariantId === v.shopifyVariantId;
              const isSaving = savingVariantId === v.shopifyVariantId;
              const isToggling = togglingVariantId === v.shopifyVariantId;

              const formatOptions = formats.map((f) => ({
                label: `${f.displayName} (${f.aspectRatio})`,
                value: f.id,
              }));
              const currentFormatInList = formats.some(
                (f) => f.id === v.format.id,
              );
              if (!currentFormatInList) {
                formatOptions.unshift({
                  label: `${v.format.displayName} (inactivo)`,
                  value: v.format.id,
                });
              }

              return (
                <IndexTable.Row
                  id={v.shopifyVariantId}
                  key={v.shopifyVariantId}
                  position={idx}
                >
                  <IndexTable.Cell>
                    {isEditing ? (
                      <div style={{ minWidth: 220 }}>
                        <Select
                          label="Formato"
                          labelHidden
                          options={formatOptions}
                          value={
                            editFormatId[v.shopifyVariantId] ?? v.format.id
                          }
                          onChange={(value) =>
                            setEditFormatId((prev) => ({
                              ...prev,
                              [v.shopifyVariantId]: value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <Badge tone="success">{v.format.displayName}</Badge>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="p" fontWeight="bold">
                      {v.shopifyVariantTitle}
                    </Text>
                    <Text variant="bodySm" tone="subdued" as="span">
                      #{v.shopifyVariantId.replace(/\D/g, "")}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        type="button"
                        onClick={() => handleToggleVariantActive(v)}
                        disabled={isToggling}
                        aria-label={
                          v.isActive
                            ? "Desactivar variante"
                            : "Activar variante"
                        }
                        title={
                          v.isActive
                            ? "Click para desactivar"
                            : "Click para activar"
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: isToggling ? "wait" : "pointer",
                          opacity: isToggling ? 0.6 : 1,
                        }}
                      >
                        <Badge tone={v.isActive ? "success" : "enabled"}>
                          {v.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </button>
                      {isToggling && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  {fulfillmentMethod === "pod" && (
                    <IndexTable.Cell>
                      {v.podConfig ? (
                        <BlockStack gap="050">
                          <InlineStack gap="100" blockAlign="center">
                            <Badge tone="success">Configurado</Badge>
                            {v.podProvider && <Badge>{v.podProvider}</Badge>}
                          </InlineStack>
                          <Text variant="bodySm" tone="subdued" as="span">
                            {String(v.podConfig.material)} /{" "}
                            {String(v.podConfig.type)}
                          </Text>
                          <Text variant="bodySm" tone="subdued" as="span">
                            {String(v.podConfig.width)}&quot; ×{" "}
                            {String(v.podConfig.height)}&quot;
                          </Text>
                        </BlockStack>
                      ) : (
                        <Badge tone="warning">Sin config</Badge>
                      )}
                    </IndexTable.Cell>
                  )}
                  <IndexTable.Cell>
                    <InlineStack gap="200">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            size="slim"
                            loading={isSaving}
                            disabled={!editFormatId[v.shopifyVariantId]}
                            onClick={() => handleSaveVariant(v)}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="slim"
                            disabled={isSaving}
                            onClick={handleCancelEdit}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="slim"
                          onClick={() => handleStartEdit(v)}
                        >
                          Editar
                        </Button>
                      )}
                      {fulfillmentMethod === "pod" && !isEditing && (
                        <Button
                          size="slim"
                          variant={v.podConfig ? "secondary" : "primary"}
                          onClick={() => onOpenPodConfig(v)}
                        >
                          POD Config
                        </Button>
                      )}
                    </InlineStack>
                  </IndexTable.Cell>
                </IndexTable.Row>
              );
            })}
          </IndexTable>

          {variants.unlinkedVariants.length > 0 && (
            <Box
              padding="400"
              borderColor="border"
              borderBlockStartWidth="025"
            >
              <BlockStack gap="300">
                <Banner tone="warning">
                  {variants.unlinkedVariants.length} variante
                  {variants.unlinkedVariants.length !== 1 ? "s" : ""} sin
                  vincular a ningún formato
                </Banner>
                {variants.unlinkedVariants.map((u) => (
                  <Box
                    key={u.shopifyVariantId}
                    padding="300"
                    borderColor="border"
                    borderWidth="025"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <BlockStack gap="050">
                        <Text as="p" fontWeight="semibold">
                          {u.shopifyVariantTitle}
                        </Text>
                        <Text variant="bodySm" tone="subdued" as="p">
                          {u.reason}
                        </Text>
                      </BlockStack>
                      {formats.length === 0 ? (
                        <Text as="p" variant="bodySm" tone="subdued">
                          No hay formatos activos.{" "}
                          <Button variant="plain" onClick={onManageFormats}>
                            Gestionar formatos
                          </Button>
                        </Text>
                      ) : (
                        <InlineStack gap="200" blockAlign="end">
                          <div style={{ minWidth: 220 }}>
                            <Select
                              label="Formato"
                              labelHidden
                              placeholder="Seleccionar formato…"
                              options={formats.map((f) => ({
                                label: `${f.displayName} (${f.aspectRatio})`,
                                value: f.id,
                              }))}
                              value={selectedFormat[u.shopifyVariantId] ?? ""}
                              onChange={(value) =>
                                setSelectedFormat((prev) => ({
                                  ...prev,
                                  [u.shopifyVariantId]: value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            variant="primary"
                            size="slim"
                            loading={linkingVariantId === u.shopifyVariantId}
                            disabled={!selectedFormat[u.shopifyVariantId]}
                            onClick={() => handleLinkVariant(u)}
                          >
                            Vincular
                          </Button>
                        </InlineStack>
                      )}
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
