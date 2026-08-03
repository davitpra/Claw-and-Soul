import { useCallback, useEffect, useState } from "react";
import { adminApi, AdminUserSession } from "@/entities/admin/api";

interface UserSessions {
  sessions: AdminUserSession[] | null;
  loading: boolean;
  /** Id de la sesión que se está revocando, o `"all"` para el cierre masivo. */
  revoking: string | null;
  error: string | null;
  dismissError: () => void;
  revokeOne: (tokenId: string) => Promise<void>;
  revokeAll: () => Promise<void>;
}

/**
 * Sesiones vivas de un usuario. Igual que `useUserCredits`, vive fuera de
 * `useUserDetail` porque solo se monta al abrir su pestaña. Sin paginación: las
 * sesiones activas de una cuenta son pocas.
 */
export function useUserSessions(userId: string): UserSessions {
  const [sessions, setSessions] = useState<AdminUserSession[] | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // `reloadToken` fuerza el refetch tras revocar.
  const [reloadToken, setReloadToken] = useState(0);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${reloadToken}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .sessions(userId)
      .then((data) => {
        if (!cancelled) setSessions(data.sessions);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, queryKey]);

  // A diferencia de la carga, las revocaciones sí reportan el error: el admin
  // acaba de pulsar un botón y necesita saber si surtió efecto.
  const run = useCallback(
    async (key: string, action: () => Promise<unknown>) => {
      setRevoking(key);
      setError(null);
      try {
        await action();
        setReloadToken((t) => t + 1);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setRevoking(null);
      }
    },
    [],
  );

  return {
    sessions,
    loading,
    revoking,
    error,
    dismissError: () => setError(null),
    revokeOne: (tokenId) =>
      run(tokenId, () => adminApi.users.revokeSession(userId, tokenId)),
    revokeAll: () =>
      run("all", () => adminApi.users.revokeAllSessions(userId)),
  };
}
