"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Page,
  Layout,
  Card,
  Text,
  InlineStack,
  BlockStack,
  Badge,
  Banner,
  Spinner,
  Box,
  Divider,
} from "@shopify/polaris";
import { adminApi, OverviewStats } from "@/entities/admin/api";

const STATUS_COLORS: Record<string, string> = {
  completed: "#448da6",
  failed: "#ef4444",
  processing: "#f59e0b",
  pending: "#6b7280",
};

const SYNC_STATUS_TONES: Record<
  string,
  "success" | "critical" | "warning"
> = {
  completed: "success",
  failed: "critical",
  running: "warning",
};

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

function StatTile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 flex flex-col gap-1 border ${
        highlight
          ? "bg-[#e8f3f6] border-[#448da6]"
          : "bg-[#f6f6f7] border-[#e3e3e3]"
      }`}
    >
      <Text variant="heading2xl" as="p">
        {typeof value === "number" ? value.toLocaleString() : value}
      </Text>
      <Text variant="bodySm" as="span" tone="subdued">
        {label}
      </Text>
      {sub && (
        <Text variant="bodySm" as="span" tone="subdued">
          {sub}
        </Text>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    adminApi.stats
      .overview()
      .then(setStats)
      .catch((e: Error) => setStatsError(e.message));
  }, []);

  if (statsError) {
    return (
      <Page title="Dashboard">
        <Banner tone="critical">{statsError}</Banner>
      </Page>
    );
  }

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

  const statusPieData = Object.entries(stats.generationsByStatus).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <Page
      title="Dashboard"
      subtitle={`Resumen general · ${today}`}
    >
      <BlockStack gap="500">
        {/* KPI tiles */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingSm" as="h2">
              Totales
            </Text>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              <StatTile
                label="Usuarios"
                value={stats.totals.users}
                sub={`${stats.usersByRole.admin ?? 0} admins`}
                highlight
              />
              <StatTile label="Mascotas" value={stats.totals.pets} />
              <StatTile
                label="Generaciones"
                value={stats.totals.generations}
                sub={`${stats.generationsByStatus.failed ?? 0} fallidas`}
              />
              <StatTile
                label="Estilos activos"
                value={stats.totals.styles}
              />
              <StatTile label="Formatos" value={stats.totals.formats} />
              <StatTile label="Productos" value={stats.totals.products} />
            </div>
          </BlockStack>
        </Card>

        {/* Charts row */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Generaciones — últimos 30 días
                </Text>
                {stats.timeline.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Sin datos aún.
                  </Text>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={stats.timeline}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E3E3E3"
                      />
                      <XAxis
                        dataKey="day"
                        tickFormatter={fmtDay}
                        tick={{ fontSize: 11, fill: "#6d7175" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6d7175" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        labelFormatter={(v) => fmtDay(String(v))}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #E3E3E3",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#448da6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Estado
                </Text>
                {statusPieData.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Sin datos.
                  </Text>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {statusPieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #E3E3E3",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Top styles */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Estilos más usados
            </Text>
            {stats.topStyles.length === 0 ? (
              <Text as="p" tone="subdued">
                Sin datos.
              </Text>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={stats.topStyles}
                  margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                  <XAxis
                    dataKey="displayName"
                    tick={{ fontSize: 11, fill: "#6d7175" }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6d7175" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E3E3E3",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#448da6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </BlockStack>
        </Card>

        {/* Recent syncs */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Sincronizaciones recientes
            </Text>
            {stats.recentSyncs.length === 0 ? (
              <Text as="p" tone="subdued">
                Sin historial de sync.
              </Text>
            ) : (
              <BlockStack gap="0">
                {stats.recentSyncs.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 && <Divider />}
                    <Box paddingBlock="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="300" blockAlign="center">
                          <Badge tone={SYNC_STATUS_TONES[s.status] ?? "enabled"}>
                            {s.status}
                          </Badge>
                          <Text as="span">{s.type}</Text>
                        </InlineStack>
                        <BlockStack gap="0" inlineAlign="end">
                          <Text variant="bodySm" tone="subdued" as="span">
                            {new Date(s.startedAt).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </Text>
                          {s.productsChecked != null && (
                            <Text variant="bodySm" tone="subdued" as="span">
                              {s.productsChecked} rev · {s.productsCreated ?? 0}{" "}
                              cr · {s.productsUpdated ?? 0} act
                            </Text>
                          )}
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </div>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
