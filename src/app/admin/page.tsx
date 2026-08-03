"use client";

import { ReactNode, useState } from "react";
import {
  Banner,
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  Page,
  Select,
  Spinner,
  Text,
} from "@shopify/polaris";
import { OverviewStats, StatsPeriod } from "@/entities/admin/api";
import { useDashboard } from "./useDashboard";
import { ActivityCard } from "./_dashboard/ActivityCard";
import { AlertsBanner } from "./_dashboard/AlertsBanner";
import { CreditsCard } from "./_dashboard/CreditsCard";
import { DashboardSection } from "./_dashboard/DashboardSection";
import { GrowthFunnelCard } from "./_dashboard/GrowthFunnelCard";
import { KpiRow } from "./_dashboard/KpiRow";
import { MoneyCard } from "./_dashboard/MoneyCard";
import { PipelineHealthCard } from "./_dashboard/PipelineHealthCard";
import { ProductionQueueCard } from "./_dashboard/ProductionQueueCard";
import { TimelineCard } from "./_dashboard/TimelineCard";
import { TopStylesCard } from "./_dashboard/TopStylesCard";
import { DASHBOARD_SECTIONS, SectionKey } from "./_dashboard/sections";

const PERIOD_OPTIONS = [
  { label: "Últimos 3 días", value: "3d" },
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Últimos 90 días", value: "90d" },
];

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  "3d": "3 días",
  "7d": "7 días",
  "30d": "30 días",
  "90d": "90 días",
};

const SECTION_OPTIONS = DASHBOARD_SECTIONS.map((section) => ({
  label: section.label,
  value: section.key,
}));

/** Dos cards que colapsan a una columna en pantallas estrechas… */
const SECTION_COLUMNS = { xs: 1, md: 2 } as const;
/** …salvo en usuarios, que es una sola card y ocupa el ancho entero. */
const SINGLE_COLUMN = { xs: 1 } as const;

export default function AdminOverviewPage() {
  const { stats, error, period, setPeriod, loading } = useDashboard();
  // Presentación pura: la respuesta trae los cuatro dominios de una vez, así que
  // cambiar de sección no dispara ningún fetch y el estado no baja al hook.
  const [section, setSection] = useState<SectionKey>("money");

  const periodLabel = PERIOD_LABELS[period];
  const activeSection =
    DASHBOARD_SECTIONS.find((s) => s.key === section) ?? DASHBOARD_SECTIONS[0];

  const controls = (
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      <Box minWidth="200px">
        <Select
          label="Sección"
          labelHidden
          options={SECTION_OPTIONS}
          value={section}
          onChange={(value) => setSection(value as SectionKey)}
        />
      </Box>
      <Box minWidth="180px">
        <Select
          label="Periodo"
          labelHidden
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => setPeriod(value as StatsPeriod)}
          disabled={loading}
        />
      </Box>
    </InlineStack>
  );

  if (error) {
    return (
      <Page title="Dashboard">
        <Banner tone="critical">{error}</Banner>
      </Page>
    );
  }

  // Solo en el primer arranque no hay nada que pintar. Al cambiar de periodo se
  // conservan los datos anteriores y el `Select` queda deshabilitado, así que la
  // página no parpadea.
  if (!stats) {
    return (
      <Page title="Dashboard">
        <Box padding="600">
          <InlineStack align="center" gap="300">
            <Spinner />
            <Text as="span" tone="subdued">
              Cargando métricas…
            </Text>
          </InlineStack>
        </Box>
      </Page>
    );
  }

  const { money, production, pipeline, growth, baseCurrency } = stats;

  return (
    <Page
      title="Dashboard"
      subtitle={`Últimos ${periodLabel} · importes en ${baseCurrency}`}
      primaryAction={controls}
    >
      <BlockStack gap="600">
        {/*
          Resumen fijo. Se ve entero en las cuatro secciones: las alertas son
          accionables siempre, y la fila de KPIs es lo que sitúa la sección
          abierta dentro del conjunto en vez de dejarla como un dato suelto.
        */}
        <BlockStack gap="400">
          <AlertsBanner
            production={production}
            pipeline={pipeline}
            syncHealth={stats.syncHealth}
          />

          <KpiRow
            money={money}
            pipeline={pipeline}
            growth={growth}
            currency={baseCurrency}
            periodLabel={periodLabel}
            section={section}
          />

          {/* La serie sigue a la sección: un solo control gobierna la página. */}
          <TimelineCard
            timeline={stats.timeline}
            metric={activeSection.metric}
            currency={baseCurrency}
            periodLabel={periodLabel}
          />
        </BlockStack>

        <DashboardSection
          title={activeSection.label}
          icon={activeSection.icon}
          description={activeSection.description}
          action={activeSection.action}
        >
          <InlineGrid
            columns={section === "users" ? SINGLE_COLUMN : SECTION_COLUMNS}
            gap="400"
          >
            {renderSectionCards(section, stats, periodLabel, period)}
          </InlineGrid>
        </DashboardSection>
      </BlockStack>
    </Page>
  );
}

/**
 * Las cards de cada dominio. Va aparte de `DASHBOARD_SECTIONS` porque cada
 * sección recibe props distintas: los metadatos de la sección son datos, esto es
 * composición.
 */
function renderSectionCards(
  section: SectionKey,
  stats: OverviewStats,
  periodLabel: string,
  period: StatsPeriod,
): ReactNode {
  const { money, production, pipeline, growth, baseCurrency } = stats;

  switch (section) {
    case "money":
      return (
        <>
          <MoneyCard money={money} currency={baseCurrency} />
          <TopStylesCard topStyles={stats.topStyles} currency={baseCurrency} />
        </>
      );
    case "orders":
      return (
        <>
          <ProductionQueueCard
            production={production}
            periodLabel={periodLabel}
          />
          <ActivityCard
            recentEvents={stats.recentEvents}
            syncHealth={stats.syncHealth}
          />
        </>
      );
    case "generations":
      return (
        <>
          <PipelineHealthCard pipeline={pipeline} currency={baseCurrency} />
          <CreditsCard
            money={money}
            currency={baseCurrency}
            period={period}
            periodLabel={periodLabel}
          />
        </>
      );
    case "users":
      return <GrowthFunnelCard growth={growth} periodLabel={periodLabel} />;
  }
}
