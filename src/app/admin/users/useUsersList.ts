"use client";

import { useEffect, useState } from "react";
import type { IndexTableProps } from "@shopify/polaris";
import { adminApi, AdminUserListItem, Paginated } from "@/entities/admin/api";
import {
  ServerSortColumn,
  SortProps,
  useServerSort,
} from "@/hooks/useTableSort";

// Columnas de la lista. Viven aquí y no en el componente de tabla porque el
// sorting es estado de la query: `useServerSort` las traduce a los params
// `sort`/`order` del endpoint paginado. Una columna sin `sortKey` no es ordenable.
//
// No hay columna "Correo": el email vive bajo el nombre, dentro de "Usuario".
// Con eso se pierde el sort por email puro, pero el backend resuelve `name` como
// `fullName (nulls last) → email`, así que los usuarios sin nombre siguen
// ordenados por email; y la búsqueda ya filtra por ambos campos.
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
];

interface UsersList {
  result: Paginated<AdminUserListItem> | null;
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  search: string;
  /** Cambia la búsqueda y vuelve a la página 1. */
  setSearch: (value: string) => void;
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
  const [result, setResult] = useState<Paginated<AdminUserListItem> | null>(
    null,
  );
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { sortKey, sortOrder, headings, sortProps } = useServerSort(COLUMNS, {
    onSortChange: () => setPage(1),
  });

  // `loading` derivado: hay carga en curso mientras la query ya resuelta no
  // coincida con la actual. Evita el setState síncrono dentro del efecto. El
  // orden entra en la clave porque también cambia la respuesta del backend.
  const queryKey = `${page}|${search}|${sortKey}|${sortOrder}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .list({
        page,
        search: search || undefined,
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
  }, [page, search, sortKey, sortOrder, queryKey]);

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
    page,
    setPage,
    headings,
    sortProps,
  };
}
