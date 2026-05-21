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
  Thumbnail,

} from "@shopify/polaris";
import { adminApi, AdminStyle } from "@/entities/admin/api";

export default function AdminStylesPage() {
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

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
              headings={[{ title: "Vista previa" }, { title: "Nombre" }, { title: "Categoría" }, { title: "Imágenes" }, { title: "Estado" }, { title: "Acción" }]}
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
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {s.displayName}
                    </Text>
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
                    <Badge tone={s.isActive ? "success" : "enabled"}>
                      {s.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Button
                      variant="plain"
                      tone={s.isActive ? "critical" : undefined}
                      size="slim"
                      loading={toggling === s.id}
                      onClick={() => handleToggle(s)}
                    >
                      {s.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        )}
      </div>
    </Page>
  );
}
