"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Page,
  Card,
  Banner,
  Spinner,
  Text,
  InlineStack,
} from "@shopify/polaris";
import { adminApi, AdminStyle } from "@/entities/admin/api";
import AdminPbnStudio from "@/app/admin/_components/pbn/AdminPbnStudio";

// Estudio PBN por estilo: monta AdminPbnStudio sembrado con el pbnConfig
// guardado del estilo y con su preview como imagen inicial. El único guardado
// disponible es "Guardar como default del estilo" (no hay pedido/item).
export default function AdminPbnStylePage() {
  const params = useParams<{ id: string }>();
  const styleId = params.id;

  const [style, setStyle] = useState<AdminStyle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!styleId) return;
    let active = true;
    adminApi.styles
      .getById(styleId)
      .then((s) => {
        if (active) setStyle(s);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [styleId]);

  if (error) {
    return (
      <Page
        title="Paint by Numbers"
        backAction={{ content: "PBN", url: "/admin/pbn" }}
      >
        <Banner tone="critical">{error}</Banner>
      </Page>
    );
  }

  if (!style) {
    return (
      <Page
        title="Paint by Numbers"
        backAction={{ content: "PBN", url: "/admin/pbn" }}
      >
        <Card>
          <InlineStack align="center" gap="300">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando estilo…
            </Text>
          </InlineStack>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title={style.displayName}
      subtitle="Configuración PBN por defecto del estilo"
      backAction={{ content: "PBN", url: "/admin/pbn" }}
      fullWidth
    >
      <AdminPbnStudio
        initialImageSrc={style.previewUrl ?? undefined}
        styleTarget={{ id: style.id, displayName: style.displayName }}
        configInit={style.pbnConfig ?? undefined}
      />
    </Page>
  );
}
