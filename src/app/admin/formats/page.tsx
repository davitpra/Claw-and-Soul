"use client";

import { useEffect, useState } from "react";
import {
  Page,
  Card,
  IndexTable,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  Modal,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { adminApi, AdminFormat } from "@/entities/admin/api";

export default function AdminFormatsPage() {
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminFormat | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", aspectRatio: "", shopifyVariantOption: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.formats
      .list()
      .then((res: unknown) => {
        const data = (res as { data?: AdminFormat[] })?.data ?? (res as AdminFormat[]);
        setFormats(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleEditOpen = (f: AdminFormat) => {
    setEditForm({
      displayName: f.displayName,
      aspectRatio: f.aspectRatio,
      shopifyVariantOption: f.shopifyVariantOption ?? "",
    });
    setEditing(f);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      await adminApi.formats.update(editing.id, {
        displayName: editForm.displayName,
        aspectRatio: editForm.aspectRatio,
        shopifyVariantOption: editForm.shopifyVariantOption.trim() || null,
      });
      setEditing(null);
      load();
    } catch (e: unknown) {
      setEditError((e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggle = async (f: AdminFormat) => {
    setToggling(f.id);
    try {
      if (f.isActive) {
        await adminApi.formats.deactivate(f.id);
      } else {
        await adminApi.formats.update(f.id, { isActive: true });
      }
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <Page title="Formatos" subtitle="Dimensiones y proporciones de salida">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {loading ? (
          <Card>
            <InlineStack align="center" gap="300">
              <Spinner size="small" />
              <Text as="span" tone="subdued">
                Cargando formatos…
              </Text>
            </InlineStack>
          </Card>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "formato", plural: "formatos" }}
              itemCount={formats.length}
              headings={[{ title: "Nombre" }, { title: "Proporción" }, { title: "Dimensiones" }, { title: "Opción Shopify" }, { title: "Estado" }, { title: "Acción" }]}
              selectable={false}
            >
              {formats.map((f, index) => (
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
                    <Badge tone={f.isActive ? "success" : "enabled"}>
                      {f.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200">
                      <Button
                        variant="plain"
                        size="slim"
                        onClick={() => handleEditOpen(f)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="plain"
                        tone={f.isActive ? "critical" : undefined}
                        size="slim"
                        loading={toggling === f.id}
                        onClick={() => handleToggle(f)}
                      >
                        {f.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </InlineStack>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => { if (!savingEdit) setEditing(null); }}
        title={`Editar formato — ${editing?.displayName ?? ""}`}
        primaryAction={{
          content: "Guardar",
          loading: savingEdit,
          onAction: handleEditSave,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: savingEdit,
            onAction: () => setEditing(null),
          },
        ]}
      >
        <Modal.Section>
          {editError && (
            <Banner tone="critical" onDismiss={() => setEditError(null)}>
              {editError}
            </Banner>
          )}
          <FormLayout>
            <TextField
              label="Nombre visible"
              value={editForm.displayName}
              onChange={(v) => setEditForm((p) => ({ ...p, displayName: v }))}
              autoComplete="off"
            />
            <TextField
              label="Proporción (aspectRatio)"
              value={editForm.aspectRatio}
              onChange={(v) => setEditForm((p) => ({ ...p, aspectRatio: v }))}
              autoComplete="off"
              helpText='Ej: "4:3", "1:1", "16:9"'
            />
            <TextField
              label="Opción Shopify (shopifyVariantOption)"
              value={editForm.shopifyVariantOption}
              onChange={(v) => setEditForm((p) => ({ ...p, shopifyVariantOption: v }))}
              autoComplete="off"
              helpText='Valor exacto del option1 de la variante en Shopify. Ej: "8x10". Dejar vacío para desvincularlo.'
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
