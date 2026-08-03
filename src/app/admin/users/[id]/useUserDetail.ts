import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApi,
  AdminUserCart,
  AdminUserDetail,
  AdminUserGeneration,
  AdminUserRevenue,
  AdminUserShippingAddress,
  AdminUserStatusSummary,
  CustomerExpenses,
  Paginated,
} from "@/entities/admin/api";

/**
 * Acción de ciclo de vida en curso. También identifica qué modal está abierto:
 * `null` = ninguno.
 */
export type UserStatusAction = "ban" | "reactivate" | "delete" | "restore";

/** Foto de mascota aplanada: arrastra a qué mascota pertenece para el alt. */
export interface UserPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
  petName: string;
  petSpecies: string;
}

interface UserDetail {
  user: AdminUserDetail | null;
  loading: boolean;
  error: string | null;
  /** Fotos de todas las mascotas en una sola lista, para la galería. */
  allPhotos: UserPhoto[];
  expenses: CustomerExpenses | null;
  loadingExpenses: boolean;
  revenue: AdminUserRevenue | null;
  loadingRevenue: boolean;
  /** Carrito abierto, o `null` si no tiene o está vacío. */
  cart: AdminUserCart | null;
  /** Dirección del último pedido, o `null` si nunca ha comprado. */
  shippingAddress: AdminUserShippingAddress | null;
  gens: Paginated<AdminUserGeneration> | null;
  gensLoading: boolean;
  genPage: number;
  setGenPage: (page: number) => void;
  /** Refleja en pantalla el saldo devuelto por un grant, sin refetch. */
  applyGrant: (newBalance: number) => void;
  /** Acción de estado con el modal abierto, o `null` si no hay ninguno. */
  statusAction: UserStatusAction | null;
  openStatusAction: (action: UserStatusAction) => void;
  closeStatusAction: () => void;
  savingStatus: boolean;
  statusError: string | null;
  dismissStatusError: () => void;
  /** Ejecuta la acción abierta. `reason` se ignora en reactivar y restaurar. */
  submitStatusAction: (reason: string) => Promise<void>;
}

/**
 * Carga y estado del detalle de usuario del admin: ficha, gastos acumulados y
 * generaciones paginadas. Vive fuera de `page.tsx` para que la página se limite
 * a componer el layout de Polaris.
 */
export function useUserDetail(id: string): UserDetail {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<CustomerExpenses | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [revenue, setRevenue] = useState<AdminUserRevenue | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  const [cart, setCart] = useState<AdminUserCart | null>(null);

  const [shippingAddress, setShippingAddress] =
    useState<AdminUserShippingAddress | null>(null);

  const [gens, setGens] = useState<Paginated<AdminUserGeneration> | null>(null);
  const [genPage, setGenPage] = useState(1);

  const [statusAction, setStatusAction] = useState<UserStatusAction | null>(
    null,
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // `gensLoading` derivado: hay carga en curso mientras la query ya resuelta no
  // coincida con la actual. Evita el setState síncrono dentro del efecto.
  const gensKey = `${id}|${genPage}`;
  const [gensLoadedKey, setGensLoadedKey] = useState<string | null>(null);
  const gensLoading = gensLoadedKey !== gensKey;

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .detail(id)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Los gastos son best-effort: si fallan, la card queda vacía pero la ficha
  // del usuario sigue siendo utilizable.
  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .expenses(id)
      .then((data) => {
        if (!cancelled) setExpenses(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingExpenses(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Los ingresos acompañan a los gastos en la misma card lateral, así que se
  // cargan aquí y con el mismo criterio best-effort. No necesitan recarga: un
  // abono manual de créditos no mueve lo facturado.
  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .revenue(id)
      .then((data) => {
        if (!cancelled) setRevenue(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingRevenue(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // El carrito también va en la columna lateral, siempre visible, así que se
  // carga aquí y no en un hook de pestaña. Sin flag de carga: la card no se
  // pinta hasta tener datos, y `null` es un resultado legítimo (sin carrito).
  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .cart(id)
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Misma columna y mismo criterio: sin flag de carga, porque `null` (nunca ha
  // comprado) es un resultado legítimo y la card sencillamente no se pinta.
  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .shippingAddress(id)
      .then((data) => {
        if (!cancelled) setShippingAddress(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    adminApi.users
      .generations(id, genPage)
      .then((data) => {
        if (!cancelled) setGens(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setGensLoadedKey(gensKey);
      });
    return () => {
      cancelled = true;
    };
  }, [id, genPage, gensKey]);

  const allPhotos = useMemo(
    () =>
      (user?.pets ?? []).flatMap((pet) =>
        pet.photos.map((photo) => ({
          ...photo,
          petName: pet.name,
          petSpecies: pet.species,
        })),
      ),
    [user],
  );

  /**
   * Ejecuta la acción de ciclo de vida abierta. El backend devuelve solo los
   * campos de estado, así que se fusionan sobre la ficha en local en vez de
   * recargarla entera: el resto (mascotas, créditos, gastos) no cambia.
   */
  const submitStatusAction = useCallback(
    async (reason: string) => {
      if (!statusAction || !user) return;

      setSavingStatus(true);
      setStatusError(null);

      try {
        let summary: AdminUserStatusSummary;

        switch (statusAction) {
          case "ban":
            summary = await adminApi.users.setStatus(user.id, {
              status: "banned",
              reason,
            });
            break;
          case "reactivate":
            summary = await adminApi.users.setStatus(user.id, {
              status: "active",
            });
            break;
          case "delete":
            summary = await adminApi.users.softDelete(user.id, { reason });
            break;
          case "restore":
            summary = await adminApi.users.restore(user.id);
            break;
        }

        setUser((prev) => (prev ? { ...prev, ...summary } : prev));
        setStatusAction(null);
      } catch (e: unknown) {
        setStatusError((e as Error).message);
      } finally {
        setSavingStatus(false);
      }
    },
    [statusAction, user],
  );

  return {
    user,
    loading,
    error,
    allPhotos,
    expenses,
    loadingExpenses,
    revenue,
    loadingRevenue,
    cart,
    shippingAddress,
    gens,
    gensLoading,
    genPage,
    setGenPage,
    applyGrant: (newBalance) =>
      setUser((prev) =>
        prev ? { ...prev, generationCredits: newBalance } : prev,
      ),
    statusAction,
    openStatusAction: (action) => {
      setStatusError(null);
      setStatusAction(action);
    },
    closeStatusAction: () => setStatusAction(null),
    savingStatus,
    statusError,
    dismissStatusError: () => setStatusError(null),
    submitStatusAction,
  };
}
