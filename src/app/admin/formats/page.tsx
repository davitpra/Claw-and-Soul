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

} from "@shopify/polaris";
import { adminApi, AdminFormat } from "@/entities/admin/api";

export default function AdminFormatsPage() {
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

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
                    <Button
                      variant="plain"
                      tone={f.isActive ? "critical" : undefined}
                      size="slim"
                      loading={toggling === f.id}
                      onClick={() => handleToggle(f)}
                    >
                      {f.isActive ? "Desactivar" : "Activar"}
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
