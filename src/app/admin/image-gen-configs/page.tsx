"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page,
  Card,
  IndexTable,
  Banner,
  BlockStack,
  Text,
  Button,
} from "@shopify/polaris";
import { adminApi, AdminImageGenConfig } from "@/entities/admin/api";
import { SortColumn, useTableSort } from "@/hooks/useTableSort";
import { ActiveToggleBadge } from "@/app/admin/_components/ActiveToggleBadge";
import { LoadingCard } from "@/app/admin/_components/LoadingCard";

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
      setError((e as Error).message);
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
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {loading ? (
          <LoadingCard message="Cargando configs…" />
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
                    <ActiveToggleBadge
                      isActive={c.isActive}
                      loading={toggling === c.id}
                      onToggle={() => handleToggle(c)}
                      resourceLabel="image gen config"
                    />
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
      </BlockStack>
    </Page>
  );
}
