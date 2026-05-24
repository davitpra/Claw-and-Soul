import { useEffect, useRef, useState } from 'react';
import { adminApi } from '@/entities/admin/api';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface AdminGenerationState {
  status: GenerationStatus | null;
  progress: number | null;
  errorMessage: string | null;
}

export function useAdminGenerationStatus(generationId: string | null) {
  const [state, setState] = useState<AdminGenerationState>({
    status: null,
    progress: null,
    errorMessage: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!generationId) {
      setState({ status: null, progress: null, errorMessage: null });
      return;
    }

    const poll = async () => {
      try {
        const data = await adminApi.styles.testGenerationStatus(generationId);
        setState({
          status: data.status as GenerationStatus,
          progress: data.progress,
          errorMessage: data.errorMessage,
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

  return state;
}
