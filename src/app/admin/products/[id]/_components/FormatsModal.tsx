"use client";

import { useState } from "react";
import {
  Modal,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  IndexTable,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { adminApi, AdminFormat } from "@/entities/admin/api";

type FormatsModalProps = {
  open: boolean;
  allFormats: AdminFormat[];
  onClose: () => void;
  onChanged: () => void;
};

export function FormatsModal({
  open,
  allFormats,
  onClose,
  onChanged,
}: FormatsModalProps) {
  const [newFormatForm, setNewFormatForm] = useState({
    name: "",
    displayName: "",
    aspectRatio: "",
    width: "",
    height: "",
    shopifyVariantOption: "",
  });
  const [creatingFormat, setCreatingFormat] = useState(false);
  const [createFormatError, setCreateFormatError] = useState<string | null>(
    null,
  );
  const [deletingFormat, setDeletingFormat] = useState<string | null>(null);
  const [togglingFormat, setTogglingFormat] = useState<string | null>(null);
  const [editingFormat, setEditingFormat] = useState<AdminFormat | null>(null);
  const [editFormatForm, setEditFormatForm] = useState({
    displayName: "",
    aspectRatio: "",
    shopifyVariantOption: "",
  });
  const [savingFormatEdit, setSavingFormatEdit] = useState(false);
  const [formatEditError, setFormatEditError] = useState<string | null>(null);

  const handleFormatCreate = async () => {
    const { name, displayName, aspectRatio, width, height, shopifyVariantOption } =
      newFormatForm;
    if (!name.trim() || !displayName.trim() || !aspectRatio.trim()) {
      setCreateFormatError("Nombre, nombre visible y proporción son obligatorios.");
      return;
    }
    const w = Number(width);
    const h = Number(height);
    if (!Number.isInteger(w) || w < 1 || !Number.isInteger(h) || h < 1) {
      setCreateFormatError("Ancho y alto deben ser enteros mayores que 0.");
      return;
    }
    setCreatingFormat(true);
    setCreateFormatError(null);
    try {
      await adminApi.formats.create({
        name: name.trim(),
        displayName: displayName.trim(),
        aspectRatio: aspectRatio.trim(),
        width: w,
        height: h,
        shopifyVariantOption: shopifyVariantOption.trim() || undefined,
      });
      setNewFormatForm({
        name: "",
        displayName: "",
        aspectRatio: "",
        width: "",
        height: "",
        shopifyVariantOption: "",
      });
      onChanged();
    } catch (e: unknown) {
      setCreateFormatError((e as Error).message);
    } finally {
      setCreatingFormat(false);
    }
  };

  const handleFormatEditOpen = (f: AdminFormat) => {
    setEditFormatForm({
      displayName: f.displayName,
      aspectRatio: f.aspectRatio,
      shopifyVariantOption: f.shopifyVariantOption ?? "",
    });
    setEditingFormat(f);
    setFormatEditError(null);
  };

  const handleFormatEditSave = async () => {
    if (!editingFormat) return;
    setSavingFormatEdit(true);
    setFormatEditError(null);
    try {
      await adminApi.formats.update(editingFormat.id, {
        displayName: editFormatForm.displayName,
        aspectRatio: editFormatForm.aspectRatio,
        shopifyVariantOption: editFormatForm.shopifyVariantOption.trim() || null,
      });
      setEditingFormat(null);
      onChanged();
    } catch (e: unknown) {
      setFormatEditError((e as Error).message);
    } finally {
      setSavingFormatEdit(false);
    }
  };

  const handleFormatDelete = async (f: AdminFormat) => {
    if (
      !confirm(
        `¿Eliminar el formato "${f.displayName}"? Quedará inactivo y no se podrá vincular a nuevas variantes.`,
      )
    )
      return;
    setDeletingFormat(f.id);
    try {
      await adminApi.formats.deactivate(f.id);
      onChanged();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setDeletingFormat(null);
    }
  };

  const handleFormatToggle = async (f: AdminFormat) => {
    setTogglingFormat(f.id);
    try {
      if (f.isActive) {
        await adminApi.formats.deactivate(f.id);
      } else {
        await adminApi.formats.update(f.id, { isActive: true });
      }
      onChanged();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setTogglingFormat(null);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Formatos"
        secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
        size="large"
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">
              Añadir formato
            </Text>
            {createFormatError && (
              <Banner
                tone="critical"
                onDismiss={() => setCreateFormatError(null)}
              >
                {createFormatError}
              </Banner>
            )}
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  label="Nombre (interno)"
                  value={newFormatForm.name}
                  onChange={(v) => setNewFormatForm((p) => ({ ...p, name: v }))}
                  autoComplete="off"
                  placeholder="square_1x1"
                />
                <TextField
                  label="Nombre visible"
                  value={newFormatForm.displayName}
                  onChange={(v) =>
                    setNewFormatForm((p) => ({ ...p, displayName: v }))
                  }
                  autoComplete="off"
                  placeholder="Cuadrado 1:1"
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField
                  label="Proporción"
                  value={newFormatForm.aspectRatio}
                  onChange={(v) =>
                    setNewFormatForm((p) => ({ ...p, aspectRatio: v }))
                  }
                  autoComplete="off"
                  placeholder="1:1"
                />
                <TextField
                  label="Ancho (px)"
                  type="number"
                  value={newFormatForm.width}
                  onChange={(v) => setNewFormatForm((p) => ({ ...p, width: v }))}
                  autoComplete="off"
                  placeholder="1024"
                />
                <TextField
                  label="Alto (px)"
                  type="number"
                  value={newFormatForm.height}
                  onChange={(v) => setNewFormatForm((p) => ({ ...p, height: v }))}
                  autoComplete="off"
                  placeholder="1024"
                />
              </FormLayout.Group>
              <TextField
                label="Opción Shopify (opcional)"
                value={newFormatForm.shopifyVariantOption}
                onChange={(v) =>
                  setNewFormatForm((p) => ({ ...p, shopifyVariantOption: v }))
                }
                autoComplete="off"
                helpText='Valor del option1 de la variante en Shopify. Ej: "8x10".'
              />
              <InlineStack align="end">
                <Button
                  variant="primary"
                  loading={creatingFormat}
                  onClick={handleFormatCreate}
                >
                  Añadir formato
                </Button>
              </InlineStack>
            </FormLayout>
          </BlockStack>
        </Modal.Section>
        <Modal.Section flush>
          <IndexTable
            resourceName={{ singular: "formato", plural: "formatos" }}
            itemCount={allFormats.length}
            headings={[
              { title: "Nombre" },
              { title: "Proporción" },
              { title: "Dimensiones" },
              { title: "Opción Shopify" },
              { title: "Estado" },
              { title: "Acciones" },
            ]}
            selectable={false}
          >
            {allFormats.map((f, index) => (
              <IndexTable.Row
                id={f.id}
                key={f.id}
                position={index}
                tone={f.isActive ? undefined : "subdued"}
              >
                <IndexTable.Cell>
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {f.displayName}
                  </Text>
                  <br />
                  <Text variant="bodySm" tone="subdued" as="span">
                    {f.name}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.aspectRatio}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.width} × {f.height}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" tone="subdued">
                    {f.shopifyVariantOption ?? "—"}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  {togglingFormat === f.id ? (
                    <Spinner size="small" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFormatToggle(f)}
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                      }}
                      aria-label={
                        f.isActive ? "Desactivar formato" : "Activar formato"
                      }
                    >
                      <Badge tone={f.isActive ? "success" : "enabled"}>
                        {f.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </button>
                  )}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack gap="200">
                    <Button
                      variant="plain"
                      size="slim"
                      onClick={() => handleFormatEditOpen(f)}
                    >
                      Editar
                    </Button>
                    {f.isActive && (
                      <Button
                        variant="plain"
                        tone="critical"
                        size="slim"
                        icon={DeleteIcon}
                        loading={deletingFormat === f.id}
                        onClick={() => handleFormatDelete(f)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </InlineStack>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Modal.Section>
      </Modal>

      <Modal
        open={!!editingFormat}
        onClose={() => {
          if (!savingFormatEdit) setEditingFormat(null);
        }}
        title={`Editar formato — ${editingFormat?.displayName ?? ""}`}
        primaryAction={{
          content: "Guardar",
          loading: savingFormatEdit,
          onAction: handleFormatEditSave,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: savingFormatEdit,
            onAction: () => setEditingFormat(null),
          },
        ]}
      >
        <Modal.Section>
          {formatEditError && (
            <Banner tone="critical" onDismiss={() => setFormatEditError(null)}>
              {formatEditError}
            </Banner>
          )}
          <FormLayout>
            <TextField
              label="Nombre visible"
              value={editFormatForm.displayName}
              onChange={(v) =>
                setEditFormatForm((p) => ({ ...p, displayName: v }))
              }
              autoComplete="off"
            />
            <TextField
              label="Proporción (aspectRatio)"
              value={editFormatForm.aspectRatio}
              onChange={(v) =>
                setEditFormatForm((p) => ({ ...p, aspectRatio: v }))
              }
              autoComplete="off"
              helpText='Ej: "4:3", "1:1", "16:9"'
            />
            <TextField
              label="Opción Shopify (shopifyVariantOption)"
              value={editFormatForm.shopifyVariantOption}
              onChange={(v) =>
                setEditFormatForm((p) => ({ ...p, shopifyVariantOption: v }))
              }
              autoComplete="off"
              helpText='Valor exacto del option1 de la variante en Shopify. Ej: "8x10". Dejar vacío para desvincularlo.'
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </>
  );
}
