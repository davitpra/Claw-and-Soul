"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/context/AuthContext";

interface CreditsWrapped {
  data: { balance: number };
}

/**
 * Saldo de créditos de generación del usuario autenticado.
 * Devuelve `balance` (null mientras carga o si no hay sesión) y `refresh()`
 * para re-consultar tras gastar/ganar créditos.
 */
export function useCredits() {
  const { authFetchJSON } = useAuthFetch();
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(null);
      return;
    }
    setIsLoading(true);
    try {
      const wrapped = await authFetchJSON<CreditsWrapped>("/credits/me");
      setBalance(wrapped.data.balance);
    } catch {
      // Silencioso: el badge simplemente no se muestra si falla la consulta.
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [authFetchJSON, isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { balance, isLoading, refresh };
}
