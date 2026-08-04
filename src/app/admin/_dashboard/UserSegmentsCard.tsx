"use client";

import Link from "next/link";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Text,
} from "@shopify/polaris";
import type { UserRecencySegments } from "@/entities/admin/api";
import { BarMeter } from "./BarMeter";
import { fmtCount, fmtPct } from "./format";

/**
 * Cómo está repartida la base de usuarios por recencia.
 *
 * Los cortes son fijos (7/30/90 días) y NO siguen al selector de periodo: las
 * dos señales de actividad se pisan a sí mismas, así que no hay historia que
 * consultar hacia atrás y la única lectura honesta es «a día de hoy». Por lo
 * mismo, aquí no se pinta ninguna variación contra el periodo anterior: saldría
 * sistemáticamente negativa por construcción.
 *
 * Cada renglón enlaza al listado ya filtrado. Con `next/link` y no `Button url`,
 * igual que `DashboardSection`: el botón de Polaris pierde la navegación de
 * cliente.
 */
export function UserSegmentsCard({
  segments,
}: {
  segments: UserRecencySegments;
}) {
  const steps = [
    { label: "Activos (7 días)", value: segments.active7d, activity: "7d" },
    { label: "Activos (30 días)", value: segments.active30d, activity: "30d" },
    { label: "Activos (90 días)", value: segments.active90d, activity: "90d" },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text variant="headingSm" as="h3">
              Actividad de la base
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              Foto de hoy, no del periodo seleccionado
            </Text>
          </BlockStack>
          <InlineStack gap="200" blockAlign="baseline">
            <Text variant="headingLg" as="span">
              {fmtCount(segments.base)}
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              clientes
            </Text>
          </InlineStack>
        </InlineStack>

        {/*
          Los tramos se anidan (los de 7 días están dentro de los de 30), así que
          las barras se leen como cuánto de la base cubre cada ventana, no como
          un reparto en partes disjuntas.
        */}
        <BlockStack gap="300">
          {steps.map((step) => (
            <BlockStack gap="100" key={step.label}>
              <InlineStack align="space-between">
                <Link
                  href={`/admin/users?activity=${step.activity}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Text variant="bodySm" as="span">
                    {step.label}
                  </Text>
                </Link>
                <Text variant="bodySm" as="span">
                  {fmtCount(step.value)}
                </Text>
              </InlineStack>
              <BarMeter value={step.value} peak={segments.base} />
            </BlockStack>
          ))}
        </BlockStack>

        <Divider />

        <BlockStack gap="150">
          <SegmentLine
            label={`Dormidos (+${segments.dormantAfterDays} días)`}
            detail="Sin login ni uso de la app desde entonces. Complemento exacto de los activos de 90 días."
            value={segments.dormant}
            pct={segments.dormantPct}
            activity="dormant"
          />
          <SegmentLine
            label="Nunca activaron"
            detail="Registrados sin mascota ni generación. Cruza los tramos de arriba: no suma con ellos."
            value={segments.neverActivated}
            pct={segments.neverActivatedPct}
            activity="never"
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

/** `StatLine` con la etiqueta enlazada al listado filtrado. */
function SegmentLine({
  label,
  detail,
  value,
  pct,
  activity,
}: {
  label: string;
  detail: string;
  value: number;
  pct: number | null;
  activity: string;
}) {
  return (
    <InlineStack align="space-between" blockAlign="start">
      <Box maxWidth="70%">
        <BlockStack gap="0">
          <Link
            href={`/admin/users?activity=${activity}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Text variant="bodySm" as="span">
              {label}
            </Text>
          </Link>
          <Text variant="bodySm" as="span" tone="subdued">
            {detail}
          </Text>
        </BlockStack>
      </Box>
      <InlineStack gap="200" blockAlign="baseline" wrap={false}>
        <Text variant="bodySm" as="span">
          {fmtCount(value)}
        </Text>
        <Text variant="bodySm" as="span" tone="subdued">
          {fmtPct(pct)}
        </Text>
      </InlineStack>
    </InlineStack>
  );
}
