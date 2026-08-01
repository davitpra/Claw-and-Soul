import { useEffect, useState } from "react";
import { adminApi, ExpenseItem, Paginated } from "@/entities/admin/api";

interface UserExpenses {
  items: Paginated<ExpenseItem> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}

/**
 * Movimientos de gasto paginados de un usuario. Va en un hook aparte de
 * `useUserDetail` porque solo se monta al abrir su pestaña: así el detalle no
 * paga la llamada si el admin nunca entra a gastos.
 */
export function useUserExpenses(userId: string): UserExpenses {
  const [items, setItems] = useState<Paginated<ExpenseItem> | null>(null);
  const [page, setPage] = useState(1);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${page}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .expenseItems(userId, page)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page, queryKey]);

  return { items, loading, page, setPage };
}
