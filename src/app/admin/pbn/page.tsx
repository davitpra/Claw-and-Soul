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
  Thumbnail,
  Button,
} from "@shopify/polaris";
import { adminApi, AdminStyle } from "@/entities/admin/api";
import { SortColumn, useTableSort } from "@/hooks/useTableSort";

const COLUMNS: SortColumn<AdminStyle>[] = [
  { title: "Vista previa" },
  { title: "Nombre", sortBy: (s) => s.displayName },
  { title: "Categoría", sortBy: (s) => s.category },
  {
    title: "Estado",
    sortBy: (s) => s.isActive,
    defaultSortDirection: "descending",
  },
  {
    title: "Config PBN",
    sortBy: (s) => Boolean(s.pbnConfig),
    defaultSortDirection: "descending",
  },
  { title: "Acciones" },
];

// Lista de estilos como puerta de entrada a la configuración PBN por estilo:
// cada fila abre /admin/pbn/[id], que monta el estudio PBN sembrado con el
// pbnConfig actual del estilo.
export default function AdminPbnPage() {
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { rows, headings, sortProps } = useTableSort(styles, COLUMNS);

  useEffect(() => {
    adminApi.styles
      .list()
      .then(setStyles)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page
      title="Paint by Numbers"
      subtitle="Configuración PBN por defecto de cada estilo"
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
                Cargando estilos…
              </Text>
            </InlineStack>
          </Card>
        ) : (
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "estilo", plural: "estilos" }}
              itemCount={rows.length}
              headings={headings}
              {...sortProps}
              selectable={false}
            >
              {rows.map((s, index) => (
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
                    <Link
                      href={`/admin/pbn/${s.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
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
                    <Badge tone={s.isActive ? "success" : "enabled"}>
                      {s.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {s.pbnConfig ? (
                      <Badge tone="success">Configurado</Badge>
                    ) : (
                      <Badge>Sin config</Badge>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Link href={`/admin/pbn/${s.id}`}>
                      <Button variant="plain" size="slim">
                        Configurar
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
