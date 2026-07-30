import { useEffect, useState } from "react";
import {
  adminApi,
  AdminUserOrderListItem,
  Paginated,
} from "@/entities/admin/api";

interface UserOrders {
  orders: Paginated<AdminUserOrderListItem> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}

/**
 * Pedidos paginados de un usuario. Va en un hook aparte de `useUserDetail`
 * porque solo se monta al abrir su pestaña: así el detalle no paga la llamada
 * si el admin nunca entra a pedidos.
 */
export function useUserOrders(userId: string): UserOrders {
  const [orders, setOrders] = useState<Paginated<AdminUserOrderListItem> | null>(
    null,
  );
  const [page, setPage] = useState(1);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${page}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .orders(userId, page)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page, queryKey]);

  return { orders, loading, page, setPage };
}
