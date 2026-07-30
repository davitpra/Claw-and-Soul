import { useEffect, useState } from "react";
import {
  adminApi,
  AdminCreditTransaction,
  Paginated,
} from "@/entities/admin/api";

interface UserCredits {
  transactions: Paginated<AdminCreditTransaction> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  /** Refresca el historial tras un abono manual, volviendo a la primera página. */
  reload: () => void;
}

/**
 * Movimientos de créditos paginados de un usuario. Igual que `useUserOrders`,
 * vive fuera de `useUserDetail` porque solo se monta al abrir su pestaña.
 */
export function useUserCredits(userId: string): UserCredits {
  const [transactions, setTransactions] =
    useState<Paginated<AdminCreditTransaction> | null>(null);
  const [page, setPage] = useState(1);
  // `reloadToken` fuerza el refetch de la misma página tras un grant.
  const [reloadToken, setReloadToken] = useState(0);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${page}|${reloadToken}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .creditTransactions(userId, page)
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page, queryKey]);

  return {
    transactions,
    loading,
    page,
    setPage,
    reload: () => {
      // El grant crea un movimiento nuevo, que es el más reciente: si ya
      // estamos en la primera página basta con recargarla.
      if (page === 1) setReloadToken((t) => t + 1);
      else setPage(1);
    },
  };
}
