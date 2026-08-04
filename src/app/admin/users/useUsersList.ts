"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IndexTableProps } from "@shopify/polaris";
import {
  adminApi,
  AdminUserListItem,
  AdminUserStatus,
  Paginated,
  UserActivityFilter,
} from "@/entities/admin/api";
import { isUserActivityFilter } from "@/entities/admin/lib/user-status";
import {
  ServerSortColumn,
  SortProps,
  useServerSort,
} from "@/hooks/useTableSort";

const COLUMNS: ServerSortColumn[] = [
  { title: "Usuario", sortKey: "name" },
  {
    title: "Mascotas",
    sortKey: "pets",
    defaultSortDirection: "descending",
    alignment: "end",
  },
  {
    title: "Generaciones",
    sortKey: "generations",
    defaultSortDirection: "descending",
    alignment: "end",
  },
  {
    title: "PBN",
    sortKey: "pbn",
    defaultSortDirection: "descending",
    alignment: "end",
  },
  {
    title: "Pedidos",
    sortKey: "orders",
    defaultSortDirection: "descending",
    alignment: "end",
  },
  {
    title: "Créditos",
    sortKey: "credits",
    defaultSortDirection: "descending",
    alignment: "end",
  },
  {
    title: "Última actividad",
    sortKey: "lastActivity",
    defaultSortDirection: "descending",
  },
  { title: "Estado" },
];

/** Filtro de estado. `null` = por defecto: todo salvo las cuentas dadas de baja. */
export type UserStatusFilter = AdminUserStatus | "all" | null;

interface UsersList {
  result: Paginated<AdminUserListItem> | null;
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  search: string;
  /** Cambia la búsqueda y vuelve a la página 1. */
  setSearch: (value: string) => void;
  status: UserStatusFilter;
  /** Cambia el filtro de estado y vuelve a la página 1. */
  setStatus: (value: UserStatusFilter) => void;
  activity: UserActivityFilter | null;
  /** Cambia el filtro de recencia, vuelve a la página 1 y sincroniza la URL. */
  setActivity: (value: UserActivityFilter | null) => void;
  page: number;
  setPage: (page: number) => void;
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
}

/**
 * Estado y carga de la lista paginada de usuarios: búsqueda, página, orden y
 * saldo de créditos. Vive fuera de `page.tsx` para que la página se limite a
 * componer el layout de Polaris.
 */
export function useUsersList(): UsersList {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<Paginated<AdminUserListItem> | null>(
    null,
  );
  const [search, setSearchValue] = useState("");
  const [status, setStatusValue] = useState<UserStatusFilter>(null);
  // Sembrado desde la URL una sola vez: las cifras de actividad del dashboard
  // enlazan aquí con `?activity=…`, y a partir de ahí manda el estado local.
  const [activity, setActivityValue] = useState<UserActivityFilter | null>(
    () => {
      const value = searchParams.get("activity");
      return isUserActivityFilter(value) ? value : null;
    },
  );
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { sortKey, sortOrder, headings, sortProps } = useServerSort(COLUMNS, {
    onSortChange: () => setPage(1),
  });

  // `loading` derivado: hay carga en curso mientras la query ya resuelta no
  // coincida con la actual. Evita el setState síncrono dentro del efecto. El
  // orden entra en la clave porque también cambia la respuesta del backend.
  const queryKey = `${page}|${search}|${status}|${activity}|${sortKey}|${sortOrder}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .list({
        page,
        search: search || undefined,
        status: status ?? undefined,
        activity: activity ?? undefined,
        sort: sortKey,
        order: sortOrder,
      })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setLoadedKey(queryKey);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, status, activity, sortKey, sortOrder, queryKey]);

  return {
    result,
    loading,
    error,
    dismissError: () => setError(null),
    search,
    setSearch: (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    status,
    setStatus: (value: UserStatusFilter) => {
      setStatusValue(value);
      setPage(1);
    },
    activity,
    setActivity: (value: UserActivityFilter | null) => {
      setActivityValue(value);
      setPage(1);
      // La URL refleja el filtro para que se pueda compartir y para que el
      // enlace del dashboard no quede colgando al cambiarlo aquí. `replace` y
      // no `push`: filtrar no debería llenar el historial de vuelta atrás.
      const params = new URLSearchParams(searchParams);
      if (value) params.set("activity", value);
      else params.delete("activity");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    page,
    setPage,
    headings,
    sortProps,
  };
}
