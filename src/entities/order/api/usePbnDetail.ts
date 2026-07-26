"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { isNotFound } from "@/shared/lib/http";
import type { ApiEnvelope, UserPbnDetail } from "../types";

// Data + mutation logic para el detalle de un Paint-by-Numbers guardado
// (GET/DELETE /paint-by-numbers/:id). Espeja `useGenerationDetail`: la
// navegación tras borrar se deja en el componente para mantener
// next/navigation fuera de la capa de entidades.
export function usePbnDetail(id: string) {
  const { get, delete: del } = useAuthFetch();

  const [pbn, setPbn] = useState<UserPbnDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await get<ApiEnvelope<UserPbnDetail>>(
        `/paint-by-numbers/${id}`,
      );
      setPbn(res.data ?? null);
    } catch (err) {
      if (isNotFound(err)) setNotFound(true);
      else setError("Couldn't load this Paint by Numbers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Borra el PBN. Resuelve a `true` en éxito para que el componente navegue; en
  // fallo deja `deleteError` poblado y resuelve `false`.
  const deletePbn = useCallback(async () => {
    if (deleting) return false;
    setDeleting(true);
    setDeleteError(null);
    try {
      await del(`/paint-by-numbers/${id}`);
      return true;
    } catch {
      setDeleting(false);
      setDeleteError("Couldn't delete this Paint by Numbers. Please try again.");
      return false;
    }
  }, [del, id, deleting]);

  return {
    pbn,
    isLoading,
    error,
    notFound,
    reload,
    deleting,
    deleteError,
    deletePbn,
  };
}
