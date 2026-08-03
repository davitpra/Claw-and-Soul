"use client";

import { useEffect, useState } from "react";
import { adminApi, OverviewStats, StatsPeriod } from "@/entities/admin/api";

/**
 * Carga las métricas del dashboard para una ventana de tiempo.
 *
 * `loading` es derivado (se compara el periodo pedido con el ya cargado) en vez
 * de un `setState` dentro del efecto: es el mismo patrón que `useUsersList` y
 * evita el render intermedio en blanco al cambiar de periodo. Los datos previos
 * siguen en pantalla mientras llega la nueva ventana.
 */
export function useDashboard() {
  const [period, setPeriod] = useState<StatsPeriod>("30d");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<StatsPeriod | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminApi.stats
      .overview(period)
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setLoadedPeriod(period);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoadedPeriod(period);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return {
    stats,
    error,
    period,
    setPeriod,
    loading: loadedPeriod !== period,
  };
}
