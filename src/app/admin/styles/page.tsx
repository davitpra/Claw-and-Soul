"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page,
  Card,
  IndexTable,
  Badge,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Thumbnail,
  Button,
  Modal,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { adminApi, AdminStyle } from "@/entities/admin/api";

export default function AdminStylesPage() {
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<AdminStyle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.styles
      .list()
      .then(setStyles)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (style: AdminStyle) => {
    setToggling(style.id);
    try {
      if (style.isActive) {
        await adminApi.styles.deactivate(style.id);
      } else {
        await adminApi.styles.update(style.id, { isActive: true });
      }
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await adminApi.styles.delete(deletingTarget.id);
      setDeletingTarget(null);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Page title="Estilos" subtitle="Catálogo de estilos de IA disponibles">
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
                Cargando estilos…
              </Text>
            </InlineStack>
          </Card>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "estilo", plural: "estilos" }}
              itemCount={styles.length}
              headings={[{ title: "Vista previa" }, { title: "Nombre" }, { title: "Categoría" }, { title: "Imágenes" }, { title: "Estado" }, { title: "Eliminar" }, { title: "Acciones" }]}
              selectable={false}
            >
              {styles.map((s, index) => (
                <IndexTable.Row
                  id={s.id}
                  key={s.id}
                  position={index}
                  tone={s.isActive ? undefined : "subdued"}
                >
                  <IndexTable.Cell>
                    {s.previewUrl ? (
                      <Thumbnail
                        source={s.previewUrl}
                        alt={s.displayName}
                        size="small"
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          background: "#f6f6f7",
                          border: "1px solid #e3e3e3",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text as="span" tone="subdued" variant="bodySm">
                          —
                        </Text>
                      </div>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Link href={`/admin/styles/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {s.displayName}
                      </Text>
                    </Link>
                    <br />
                    <Text variant="bodySm" tone="subdued" as="span">
                      {s.name}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {s.category}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span">{s.images.length}</Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        type="button"
                        onClick={() => handleToggle(s)}
                        disabled={toggling === s.id}
                        aria-label={s.isActive ? "Desactivar estilo" : "Activar estilo"}
                        title={s.isActive ? "Click para desactivar" : "Click para activar"}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: toggling === s.id ? "wait" : "pointer",
                          opacity: toggling === s.id ? 0.6 : 1,
                        }}
                      >
                        <Badge tone={s.isActive ? "success" : "enabled"}>
                          {s.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                      {toggling === s.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Button
                      variant="plain"
                      tone="critical"
                      size="slim"
                      icon={DeleteIcon}
                      accessibilityLabel={`Eliminar ${s.displayName}`}
                      onClick={() => setDeletingTarget(s)}
                    />
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Link href={`/admin/styles/${s.id}`}>
                      <Button variant="plain" size="slim">
                        Ver
                      </Button>
                    </Link>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        )}
      </div>
      <Modal
        open={deletingTarget !== null}
        onClose={() => {
          if (!deleting) setDeletingTarget(null);
        }}
        title="¿Eliminar estilo permanentemente?"
        primaryAction={{
          content: "Eliminar",
          destructive: true,
          loading: deleting,
          onAction: handleDelete,
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            disabled: deleting,
            onAction: () => setDeletingTarget(null),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">
              Se eliminará{" "}
              <Text as="span" fontWeight="semibold">
                {deletingTarget?.displayName}
              </Text>{" "}
              de forma permanente.
            </Text>
            <Text as="p" tone="subdued">
              Las imágenes del estilo se borrarán también del almacenamiento.
              Las referencias de producto perderán el vínculo con este estilo.
              Esta acción no se puede deshacer.
            </Text>
            {(deletingTarget?._count?.generations ?? 0) > 0 && (
              <Text as="p" tone="critical">
                Este estilo tiene {deletingTarget!._count!.generations} generación(es) asociada(s) y no podrá eliminarse. Desactívalo en su lugar.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
