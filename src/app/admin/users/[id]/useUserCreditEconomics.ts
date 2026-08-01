import { useEffect, useState } from "react";
import { adminApi, AdminUserCreditEconomics } from "@/entities/admin/api";

interface UserCreditEconomics {
  economics: AdminUserCreditEconomics | null;
  loading: boolean;
  /** Refresca las cifras tras un abono manual: el pasivo cambia con el saldo. */
  reload: () => void;
}

/**
 * Traducción a dinero de los créditos de un usuario. Igual que `useUserCredits`,
 * vive fuera de `useUserDetail` porque solo se monta al abrir su pestaña.
 */
export function useUserCreditEconomics(userId: string): UserCreditEconomics {
  const [economics, setEconomics] = useState<AdminUserCreditEconomics | null>(
    null,
  );
  const [reloadToken, setReloadToken] = useState(0);

  // `loading` derivado: evita el setState síncrono dentro del efecto.
  const queryKey = `${userId}|${reloadToken}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.credits
      .userEconomics(userId)
      .then((data) => {
        if (!cancelled) setEconomics(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadedKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, queryKey]);

  return {
    economics,
    loading,
    reload: () => setReloadToken((t) => t + 1),
  };
}
