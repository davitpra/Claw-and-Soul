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
import StatCard from "@/shared/ui/StatCard";
import { adminApi, OverviewStats } from "@/entities/admin/api";

const STATUS_COLORS: Record<string, string> = {
  completed: "#448da6",
  failed: "#ef4444",
  processing: "#f59e0b",
  pending: "#6b7280",
};

const SYNC_STATUS_BADGE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  running: "bg-amber-50 text-amber-700",
};

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { month: "short", day: "numeric" });
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
    adminApi.stats.overview().then(setStats).catch((e: Error) => setStatsError(e.message));
  }, []);

  if (statsError) {
    return (
      <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4">
        <span className="material-symbols-outlined">error</span>
        <span className="text-sm font-semibold">Error: {statsError}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-3 text-text-muted">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        <span className="text-sm">Cargando métricas…</span>
      </div>
    );
  }

  const statusPieData = Object.entries(stats.generationsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
            Dashboard
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Resumen general de la actividad de la tienda
          </p>
        </div>
        <div className="flex items-center gap-2 border border-[#E0DED9] rounded-xl px-3.5 py-2 bg-white shadow-sm text-sm text-text-muted">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          {today}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Usuarios totales"
          value={stats.totals.users}
          icon="group"
          sub={`${stats.usersByRole.admin ?? 0} admins`}
          highlight
        />
        <StatCard label="Mascotas" value={stats.totals.pets} icon="pets" />
        <StatCard
          label="Generaciones"
          value={stats.totals.generations}
          icon="auto_awesome"
          sub={`${stats.generationsByStatus.failed ?? 0} fallidas`}
        />
        <StatCard label="Estilos activos" value={stats.totals.styles} icon="palette" />
        <StatCard label="Formatos" value={stats.totals.formats} icon="aspect_ratio" />
        <StatCard label="Productos" value={stats.totals.products} icon="inventory_2" />
      </div>

      {/* Generaciones — últimos 30 días + Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E0DED9] p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-dark font-display mb-4">
            Generaciones — últimos 30 días
          </h2>
          {stats.timeline.length === 0 ? (
            <p className="text-text-muted text-sm">Sin datos aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DED9" />
                <XAxis
                  dataKey="day"
                  tickFormatter={fmtDay}
                  tick={{ fontSize: 11, fill: "#5c747c" }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: "#5c747c" }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) => fmtDay(String(v))}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E0DED9", fontSize: 12 }}
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
        </div>

        <div className="bg-white rounded-xl border border-[#E0DED9] p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-dark font-display mb-4">Estado</h2>
          {statusPieData.length === 0 ? (
            <p className="text-text-muted text-sm">Sin datos.</p>
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
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E0DED9", fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Estilos más usados */}
      <div className="bg-white rounded-xl border border-[#E0DED9] p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-dark font-display mb-4">
          Estilos más usados
        </h2>
        {stats.topStyles.length === 0 ? (
          <p className="text-text-muted text-sm">Sin datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats.topStyles}
              margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DED9" />
              <XAxis
                dataKey="displayName"
                tick={{ fontSize: 11, fill: "#5c747c" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#5c747c" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E0DED9", fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#448da6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sincronizaciones recientes */}
      <div className="bg-white rounded-xl border border-[#E0DED9] p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-dark font-display mb-4">
          Sincronizaciones recientes
        </h2>
        {stats.recentSyncs.length === 0 ? (
          <p className="text-text-muted text-sm">Sin historial de sync.</p>
        ) : (
          <div className="divide-y divide-[#E0DED9]">
            {stats.recentSyncs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      SYNC_STATUS_BADGE[s.status] ?? "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-sm text-text-main capitalize">{s.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">
                    {new Date(s.startedAt).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  {s.productsChecked != null && (
                    <p className="text-xs text-text-muted">
                      {s.productsChecked} revisados · {s.productsCreated ?? 0} creados ·{" "}
                      {s.productsUpdated ?? 0} actualizados
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
