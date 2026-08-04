"use client";

import {
  BlockStack,
  Card,
  Divider,
  InlineStack,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import type { ActivationCohort } from "@/entities/admin/api";
import { BarMeter } from "./BarMeter";
import { StatLine } from "./StatLine";
import { fmtCount, fmtPct } from "./format";

/** Por debajo de esto la cohorte aún no ha tenido tiempo de significar nada. */
const MIN_MATURITY_DAYS = 7;

/**
 * Embudo de las altas del periodo, persiguiendo al mismo usuario.
 *
 * A diferencia del embudo de volumen que había antes aquí, cada escalón exige
 * todos los anteriores, así que la cifra nunca puede subir de un paso al
 * siguiente. Los hechos se cuentan hasta hoy, sin tope: quien se registró el
 * primer día y compró el día 25 cuenta como comprador.
 */
export function ActivationCohortCard({
  cohort,
  periodLabel,
  loading,
}: {
  cohort: ActivationCohort | null;
  periodLabel: string;
  loading: boolean;
}) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text variant="headingSm" as="h3">
              Activación de las altas
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              Qué hicieron los registrados en los últimos {periodLabel}
            </Text>
          </BlockStack>
          {cohort && (
            <InlineStack gap="200" blockAlign="baseline">
              <Text variant="headingLg" as="span">
                {fmtCount(cohort.signups)}
              </Text>
              <Text variant="bodySm" as="span" tone="subdued">
                altas
              </Text>
            </InlineStack>
          )}
        </InlineStack>

        {loading || !cohort ? (
          <SkeletonBodyText lines={6} />
        ) : (
          <CohortBody cohort={cohort} />
        )}
      </BlockStack>
    </Card>
  );
}

function CohortBody({ cohort }: { cohort: ActivationCohort }) {
  const steps = [
    { label: "Registraron una mascota", value: cohort.withPet },
    { label: "…y completaron una generación", value: cohort.withGeneration },
    { label: "…y guardaron un PBN", value: cohort.withPbn },
    { label: "…y pagaron un pedido", value: cohort.withPaidOrder },
  ];

  return (
    <BlockStack gap="400">
      {cohort.signups === 0 ? (
        <Text as="p" tone="subdued">
          Sin altas en este periodo.
        </Text>
      ) : (
        <BlockStack gap="300">
          {steps.map((step) => (
            <BlockStack gap="100" key={step.label}>
              <InlineStack align="space-between">
                <Text variant="bodySm" as="span">
                  {step.label}
                </Text>
                <Text variant="bodySm" as="span">
                  {fmtCount(step.value)}
                </Text>
              </InlineStack>
              <BarMeter value={step.value} peak={cohort.signups} />
            </BlockStack>
          ))}
        </BlockStack>
      )}

      <Divider />

      <BlockStack gap="150">
        <StatLine
          label="Llegaron a generar"
          detail="Sobre el total de altas del periodo"
          value={fmtPct(cohort.activationPct)}
        />
        <StatLine
          label="Llegaron a comprar"
          detail="Solo pedidos enlazados a la cuenta: una compra como invitado no se atribuye"
          value={fmtPct(cohort.purchasePct)}
        />
        <StatLine
          label="Volvieron tras el registro"
          detail="Dieron señales de vida más de 24 h después de darse de alta"
          value={fmtPct(cohort.returnedPct)}
        />
      </BlockStack>

      {/*
        Con ventanas cortas la cohorte apenas ha tenido tiempo de comprar, y sin
        este aviso un embudo bajo se lee como una caída de la activación en vez
        de como una cohorte joven.
      */}
      {cohort.maturityDays < MIN_MATURITY_DAYS && (
        <Text variant="bodySm" as="p" tone="subdued">
          Cohorte joven: estas altas llevan como mucho {cohort.maturityDays}{" "}
          días. Los escalones finales aún tienen margen para moverse.
        </Text>
      )}
    </BlockStack>
  );
}
