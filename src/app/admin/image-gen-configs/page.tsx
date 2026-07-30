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
  Button,
} from "@shopify/polaris";
import { adminApi, AdminImageGenConfig } from "@/entities/admin/api";
import { SortColumn, useTableSort } from "@/hooks/useTableSort";

const COLUMNS: SortColumn<AdminImageGenConfig>[] = [
  { title: "Nombre", sortBy: (c) => c.name },
  { title: "Modelo", sortBy: (c) => c.model },
  {
    title: "Estado",
    sortBy: (c) => c.isActive,
    defaultSortDirection: "descending",
  },
  { title: "Acciones" },
];

export default function AdminImageGenConfigsPage() {
  const [configs, setConfigs] = useState<AdminImageGenConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const { rows, headings, sortProps } = useTableSort(configs, COLUMNS);

  const load = () => {
    setLoading(true);
    adminApi.imageGenConfigs
      .list()
      .then(setConfigs)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (config: AdminImageGenConfig) => {
    setToggling(config.id);
    try {
      await adminApi.imageGenConfigs.update(config.id, {
        isActive: !config.isActive,
      });
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <Page
      title="Image Gen Configs"
      subtitle="Configuraciones del generador de imágenes"
      primaryAction={{
        content: "Crear image gen config",
        url: "/admin/image-gen-configs/new",
      }}
    >
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
                Cargando configs…
              </Text>
            </InlineStack>
          </Card>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{
                singular: "image gen config",
                plural: "image gen configs",
              }}
              itemCount={rows.length}
              headings={headings}
              {...sortProps}
              selectable={false}
            >
              {rows.map((c, index) => (
                <IndexTable.Row
                  id={c.id}
                  key={c.id}
                  position={index}
                  tone={c.isActive ? undefined : "subdued"}
                >
                  <IndexTable.Cell>
                    <Link
                      href={`/admin/image-gen-configs/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {c.name}
                      </Text>
                    </Link>
                    {c.description && (
                      <>
                        <br />
                        <Text variant="bodySm" tone="subdued" as="span">
                          {c.description}
                        </Text>
                      </>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" tone="subdued">
                      {c.model ?? "—"}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        type="button"
                        onClick={() => handleToggle(c)}
                        disabled={toggling === c.id}
                        aria-label={
                          c.isActive
                            ? "Desactivar image gen config"
                            : "Activar image gen config"
                        }
                        title={
                          c.isActive
                            ? "Click para desactivar"
                            : "Click para activar"
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: toggling === c.id ? "wait" : "pointer",
                          opacity: toggling === c.id ? 0.6 : 1,
                        }}
                      >
                        <Badge tone={c.isActive ? "success" : "enabled"}>
                          {c.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                      {toggling === c.id && <Spinner size="small" />}
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Link href={`/admin/image-gen-configs/${c.id}`}>
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
    </Page>
  );
}
