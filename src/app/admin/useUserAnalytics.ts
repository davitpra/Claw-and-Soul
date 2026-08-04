"use client";

import { useEffect, useState } from "react";
import { adminApi, StatsPeriod, UsersDetailStats } from "@/entities/admin/api";

/**
 * Carga diferida de los bloques pesados de la sección Usuarios.
 *
 * Mismo patrón de `loading` derivado que `useDashboard`, con dos diferencias:
 * no pide nada mientras `enabled` sea falso —la sección Usuarios es una de
 * cuatro, y el overview ya paga el costo de la visita—, y guarda qué periodo
 * tiene cargado, así que cerrar y reabrir la sección no dispara otra petición.
 */
export function useUserAnalytics(period: StatsPeriod, enabled: boolean) {
  const [data, setData] = useState<UsersDetailStats | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<StatsPeriod | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || loadedPeriod === period) return;

    let cancelled = false;

    adminApi.stats
      .users(period)
      .then((result) => {
        if (cancelled) return;
        setData(result);
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
  }, [period, enabled, loadedPeriod]);

  return {
    data,
    error,
    // Sin `enabled` no hay carga en curso: la sección ni siquiera está abierta.
    loading: enabled && loadedPeriod !== period,
  };
}
