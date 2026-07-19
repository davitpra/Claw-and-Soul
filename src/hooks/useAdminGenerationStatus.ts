import { useEffect, useRef, useState } from 'react';
import { adminApi } from '@/entities/admin/api';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface AdminGenerationState {
  status: GenerationStatus | null;
  progress: number | null;
  errorMessage: string | null;
}

const EMPTY_STATE: AdminGenerationState = {
  status: null,
  progress: null,
  errorMessage: null,
};

export function useAdminGenerationStatus(generationId: string | null) {
  // Guardamos el estado junto al id que lo produjo: así al cambiar (o limpiar)
  // el generationId el reset es derivado y no hace falta un setState en el efecto.
  const [entry, setEntry] = useState<{
    id: string;
    state: AdminGenerationState;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!generationId) return;

    const poll = async () => {
      try {
        const data = await adminApi.styles.testGenerationStatus(generationId);
        setEntry({
          id: generationId,
          state: {
            status: data.status as GenerationStatus,
            progress: data.progress,
            errorMessage: data.errorMessage,
          },
        });
        if (data.status === 'completed' || data.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // network error — keep polling
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [generationId]);

  return entry?.id === generationId ? entry.state : EMPTY_STATE;
}
