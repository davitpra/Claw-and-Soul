"use client";

import { useState, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export interface GeneratePayload {
  petId: string;
  petPhotoId?: string;
  formatId: string;
  productRefId: string;
  width?: number;
  height?: number;
  prompt?: string;
  userSelections?: Record<string, string | number>;
}

interface GenerationResponse {
  id: string;
  status: string;
}

interface ApiWrapped<T> {
  data: T;
}

export function useGenerateImage() {
  const { authFetchJSON } = useAuthFetch();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (payload: GeneratePayload): Promise<GenerationResponse> => {
      setIsCreating(true);
      setError(null);
      try {
        const wrapped = await authFetchJSON<ApiWrapped<GenerationResponse>>(
          "/generations",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        return wrapped.data;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Couldn't start the generation. Please try again.";
        setError(msg);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [authFetchJSON]
  );

  return { generate, isCreating, error };
}
