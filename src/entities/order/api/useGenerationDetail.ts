"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { isNotFound } from "@/shared/lib/http";
import type { ApiEnvelope, UserGenerationDetail } from "../types";

// Data + mutation logic para el detalle de una generación de IA
// (GET/PATCH/DELETE /generations/:id). La navegación tras borrar se deja en el
// componente para mantener next/navigation fuera de la capa de entidades.
export function useGenerationDetail(id: string) {
  const { get, authFetchJSON, delete: del } = useAuthFetch();

  const [generation, setGeneration] = useState<UserGenerationDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await get<ApiEnvelope<UserGenerationDetail>>(
        `/generations/${id}`,
      );
      setGeneration(res.data ?? null);
      setIsFavorite(res.data?.isFavorite ?? false);
    } catch (err) {
      if (isNotFound(err)) setNotFound(true);
      else setError("Couldn't load this artwork. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleFavorite = useCallback(async () => {
    if (savingFavorite) return;
    const next = !isFavorite;
    setIsFavorite(next); // optimista
    setSavingFavorite(true);
    try {
      await authFetchJSON(`/generations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
    } catch {
      setIsFavorite(!next); // revertir en fallo
    } finally {
      setSavingFavorite(false);
    }
  }, [authFetchJSON, id, isFavorite, savingFavorite]);

  // Borra la generación. Resuelve a `true` en éxito para que el componente
  // navegue; en fallo deja `deleteError` poblado y resuelve `false`.
  const deleteGeneration = useCallback(async () => {
    if (deleting) return false;
    setDeleting(true);
    setDeleteError(null);
    try {
      await del(`/generations/${id}`);
      return true;
    } catch {
      setDeleting(false);
      setDeleteError("Couldn't delete this artwork. Please try again.");
      return false;
    }
  }, [del, id, deleting]);

  return {
    generation,
    isLoading,
    error,
    notFound,
    reload,
    isFavorite,
    savingFavorite,
    toggleFavorite,
    deleting,
    deleteError,
    deleteGeneration,
  };
}
