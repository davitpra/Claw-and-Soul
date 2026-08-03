import { useEffect, useState } from "react";
import {
  adminApi,
  AdminAuditLogEntry,
  AdminAuditScope,
  Paginated,
} from "@/entities/admin/api";

interface UserAuditLog {
  entries: Paginated<AdminAuditLogEntry> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  scope: AdminAuditScope;
  setScope: (scope: AdminAuditScope) => void;
}

/**
 * Historial de auditoría paginado de un usuario. Igual que `useUserOrders`,
 * vive fuera de `useUserDetail` porque solo se monta al abrir su pestaña.
 */
export function useUserAuditLog(userId: string): UserAuditLog {
  const [entries, setEntries] = useState<Paginated<AdminAuditLogEntry> | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [scope, setScopeState] = useState<AdminAuditScope>("target");

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${page}|${scope}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .auditLog(userId, page, scope)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page, scope, queryKey]);

  return {
    entries,
    loading,
    page,
    setPage,
    scope,
    // Cambiar de scope cambia el conjunto entero: la página actual ya no
    // significa lo mismo.
    setScope: (next) => {
      setScopeState(next);
      setPage(1);
    },
  };
}
