"use client";

import { useState, useEffect } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export type GenerationStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

interface PollState {
  id: string;
  status: Exclude<GenerationStatus, "idle">;
  progress: number | null;
  imageUrl: string | null;
  error: string | null;
}

interface StatusResponse {
  status: string;
  progress?: number;
}

interface GenerationDetail {
  resultUrl: string;
}

interface UseGenerationStatusOpts {
  intervalMs?: number;
  maxMs?: number;
}

export function useGenerationStatus(
  id: string | null,
  opts?: UseGenerationStatusOpts
) {
  const { authFetchJSON } = useAuthFetch();
  const intervalMs = opts?.intervalMs ?? 2500;
  const maxMs = opts?.maxMs ?? 180000;

  const [pollState, setPollState] = useState<PollState | null>(null);

  useEffect(() => {
    if (!id) return;

    let stopped = false;
    const startTime = Date.now();
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (stopped) return;

      if (Date.now() - startTime > maxMs) {
        setPollState({
          id,
          status: "failed",
          progress: null,
          imageUrl: null,
          error: "La generación está tardando más de lo normal. Intenta de nuevo.",
        });
        return;
      }

      try {
        const wrappedStatus = await authFetchJSON<{ data: StatusResponse }>(
          `/generations/${id}/status`
        );
        if (stopped) return;

        const res = wrappedStatus.data;
        const newStatus = res.status as Exclude<GenerationStatus, "idle">;

        if (newStatus === "completed") {
          const wrappedDetail = await authFetchJSON<{ data: GenerationDetail }>(
            `/generations/${id}`
          );
          const detail = wrappedDetail.data;
          if (!stopped) {
            setPollState({
              id,
              status: "completed",
              progress: null,
              imageUrl: detail.resultUrl,
              error: null,
            });
          }
          return;
        }

        if (newStatus === "failed") {
          setPollState({
            id,
            status: "failed",
            progress: null,
            imageUrl: null,
            error: "La generación falló. Por favor intenta de nuevo.",
          });
          return;
        }

        setPollState((prev) =>
          prev?.id === id
            ? { ...prev, status: newStatus, progress: res.progress ?? null }
            : { id, status: newStatus, progress: res.progress ?? null, imageUrl: null, error: null }
        );

        timeoutId = setTimeout(poll, intervalMs);
      } catch {
        if (!stopped) {
          timeoutId = setTimeout(poll, intervalMs * 2);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeoutId);
        poll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    poll();

    return () => {
      stopped = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, authFetchJSON, intervalMs, maxMs]);

  if (!id) {
    return { status: "idle" as GenerationStatus, progress: null, imageUrl: null, error: null };
  }

  // pollState belongs to a different id (or hasn't arrived yet) → show pending
  if (!pollState || pollState.id !== id) {
    return { status: "pending" as GenerationStatus, progress: null, imageUrl: null, error: null };
  }

  return {
    status: pollState.status as GenerationStatus,
    progress: pollState.progress,
    imageUrl: pollState.imageUrl,
    error: pollState.error,
  };
}
