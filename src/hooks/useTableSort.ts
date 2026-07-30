"use client";

import { useCallback, useMemo, useState } from "react";
import type { IndexTableProps } from "@shopify/polaris";

// Sorting por columna para los IndexTable del admin. Polaris ya pinta el
// encabezado clicable y calcula la dirección del siguiente click; lo que hace
// falta es el estado (qué columna y en qué sentido) y ordenar los datos.
//
// Las tablas se describen como un array de columnas en vez de indexar por
// número: los `headings` y el array `sortable` que espera Polaris se derivan del
// mismo array, así que los índices siempre coinciden aunque la tabla oculte
// columnas condicionalmente (es el caso de ProductsTable con `showStyleColumn`).
//
// Dos variantes:
// - `useTableSort`: ordena en el cliente. Para las tablas que ya reciben el
//   dataset completo.
// - `useServerSort`: solo lleva el estado y lo traduce a los params `sort`/
//   `order` de la API. Para las tablas paginadas por el backend, donde ordenar
//   solo la página visible mentiría (la fila más alta puede estar en otra página).

export type SortDirection = NonNullable<IndexTableProps["sortDirection"]>;

/** Valor por el que se compara una fila. `null`/`undefined` van siempre al final. */
export type SortValue = string | number | boolean | null | undefined;

interface ColumnBase {
  title: string;
  /** Dirección del primer click sobre la columna. Polaris usa "descending". */
  defaultSortDirection?: SortDirection;
}

export interface SortColumn<T> extends ColumnBase {
  /** Si se define, la columna es ordenable por este valor. */
  sortBy?: (item: T) => SortValue;
}

export interface ServerSortColumn extends ColumnBase {
  /** Si se define, la columna es ordenable por este campo del backend. */
  sortKey?: string;
}

/** Props de sorting listas para esparcir sobre `<IndexTable>`. */
export interface SortProps {
  sortable: boolean[];
  sortColumnIndex: number | undefined;
  sortDirection: SortDirection;
  defaultSortDirection: SortDirection;
  sortToggleLabels: IndexTableProps["sortToggleLabels"];
  onSort: (index: number, direction: SortDirection) => void;
}

/**
 * Compara dos valores de celda respetando la dirección pedida, salvo para los
 * huecos: una fila sin valor ("Sin asignar", "—") queda al final en los dos
 * sentidos, porque encabezar la tabla con vacíos nunca es lo que se busca.
 */
export function compareSortValues(
  a: SortValue,
  b: SortValue,
  direction: SortDirection,
): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  const sign = direction === "ascending" ? 1 : -1;

  if (typeof a === "string" && typeof b === "string") {
    // `numeric` para que "Retrato 10" vaya después de "Retrato 9"; `sensitivity`
    // base para que los acentos no alteren el orden.
    return (
      sign * a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
    );
  }

  const an = Number(a);
  const bn = Number(b);
  return sign * (an === bn ? 0 : an < bn ? -1 : 1);
}

/**
 * Estado compartido por las dos variantes: qué columna está activa, en qué
 * dirección, y los props derivados para Polaris.
 */
function useSortState(
  columns: ColumnBase[],
  sortableFlags: boolean[],
  onSortChange?: () => void,
): {
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
  index: number | undefined;
  direction: SortDirection;
} {
  // `undefined` = sin orden aplicado: se respeta el orden en que llegan las
  // filas (el del backend) hasta que el usuario elige una columna.
  const [index, setIndex] = useState<number | undefined>(undefined);
  const [direction, setDirection] = useState<SortDirection>("descending");

  const onSort = useCallback(
    (nextIndex: number, nextDirection: SortDirection) => {
      setIndex(nextIndex);
      setDirection(nextDirection);
      onSortChange?.();
    },
    [onSortChange],
  );

  const headings = useMemo(
    () =>
      columns.map((c) => ({
        title: c.title,
        defaultSortDirection: c.defaultSortDirection,
      })) as IndexTableProps["headings"],
    [columns],
  );

  // Polaris lee `sortToggleLabels[index][direction]` sin comprobar que exista,
  // así que toda columna ordenable necesita su entrada o el tooltip revienta.
  const sortToggleLabels = useMemo(() => {
    const labels: NonNullable<IndexTableProps["sortToggleLabels"]> = {};
    sortableFlags.forEach((isSortable, i) => {
      if (isSortable) {
        labels[i] = {
          ascending: "Orden ascendente",
          descending: "Orden descendente",
        };
      }
    });
    return labels;
  }, [sortableFlags]);

  return {
    headings,
    index,
    direction,
    sortProps: {
      sortable: sortableFlags,
      sortColumnIndex: index,
      sortDirection: direction,
      // Primer click A→Z, que es lo que se espera de las columnas de texto (la
      // mayoría). Las de números, fechas y estados lo invierten declarando
      // `defaultSortDirection: "descending"` para empezar por lo más alto.
      defaultSortDirection: "ascending",
      sortToggleLabels,
      onSort,
    },
  };
}

/**
 * Ordena `items` en el cliente por la columna que elija el usuario.
 *
 * ```tsx
 * const { rows, headings, sortProps } = useTableSort(styles, columns);
 * <IndexTable headings={headings} {...sortProps} itemCount={rows.length}>
 *   {rows.map(…)}
 * </IndexTable>
 * ```
 */
export function useTableSort<T>(
  items: T[],
  columns: SortColumn<T>[],
): {
  rows: T[];
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
} {
  const sortableFlags = useMemo(
    () => columns.map((c) => Boolean(c.sortBy)),
    [columns],
  );
  const { headings, sortProps, index, direction } = useSortState(
    columns,
    sortableFlags,
  );

  const rows = useMemo(() => {
    const sortBy = index === undefined ? undefined : columns[index]?.sortBy;
    if (!sortBy) return items;
    // Copia porque `sort` muta; el sort de JS es estable, así que las filas
    // empatadas conservan el orden que traían.
    return [...items].sort((a, b) =>
      compareSortValues(sortBy(a), sortBy(b), direction),
    );
    // `columns` entra en las deps a propósito: hay accessors que dependen de
    // datos que cargan tarde (el productTypeMap de ProductsTable), y con la
    // lista memoizada por identidad el orden se quedaría obsoleto.
  }, [items, columns, index, direction]);

  return { rows, headings, sortProps };
}

/**
 * Igual que `useTableSort` pero sin tocar los datos: traduce la columna activa a
 * los params `sort`/`order` que aceptan los endpoints paginados del admin.
 *
 * `onSortChange` sirve para volver a la página 1 al reordenar, igual que ya
 * hacen los filtros de esas páginas.
 */
export function useServerSort(
  columns: ServerSortColumn[],
  options: { onSortChange?: () => void } = {},
): {
  /** Campo por el que ordenar; `undefined` deja el orden por defecto del backend. */
  sortKey: string | undefined;
  sortOrder: "asc" | "desc" | undefined;
  headings: IndexTableProps["headings"];
  sortProps: SortProps;
} {
  const sortableFlags = useMemo(
    () => columns.map((c) => Boolean(c.sortKey)),
    [columns],
  );
  const { headings, sortProps, index, direction } = useSortState(
    columns,
    sortableFlags,
    options.onSortChange,
  );

  const sortKey = index === undefined ? undefined : columns[index]?.sortKey;

  return {
    sortKey,
    // Devolvemos primitivas (no un objeto) para que las páginas puedan meterlas
    // en sus `queryKey`/deps sin recrear el valor en cada render.
    sortOrder: sortKey
      ? direction === "ascending"
        ? "asc"
        : "desc"
      : undefined,
    headings,
    sortProps,
  };
}
