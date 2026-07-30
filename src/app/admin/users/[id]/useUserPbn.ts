import { useEffect, useState } from "react";
import { adminApi, AdminUserPbn, Paginated } from "@/entities/admin/api";

interface UserPbn {
  pbns: Paginated<AdminUserPbn> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}

/**
 * Paint by Numbers guardados de un usuario, paginados. Va en un hook aparte de
 * `useUserDetail` porque solo se monta al abrir su pestaña: así el detalle no
 * paga la llamada si el admin nunca entra a PBN.
 */
export function useUserPbn(userId: string): UserPbn {
  const [pbns, setPbns] = useState<Paginated<AdminUserPbn> | null>(null);
  const [page, setPage] = useState(1);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${page}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .paintByNumbers(userId, page)
      .then((data) => {
        if (!cancelled) setPbns(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page, queryKey]);

  return { pbns, loading, page, setPage };
}
