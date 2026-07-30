import { useEffect, useMemo, useState } from "react";
import {
  adminApi,
  AdminUserDetail,
  AdminUserGeneration,
  CustomerExpenses,
  Paginated,
} from "@/entities/admin/api";

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
  gens: Paginated<AdminUserGeneration> | null;
  gensLoading: boolean;
  genPage: number;
  setGenPage: (page: number) => void;
  /** Refleja en pantalla el saldo devuelto por un grant, sin refetch. */
  applyGrant: (newBalance: number) => void;
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

  const [gens, setGens] = useState<Paginated<AdminUserGeneration> | null>(null);
  const [genPage, setGenPage] = useState(1);

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

  return {
    user,
    loading,
    error,
    allPhotos,
    expenses,
    loadingExpenses,
    gens,
    gensLoading,
    genPage,
    setGenPage,
    applyGrant: (newBalance) =>
      setUser((prev) =>
        prev ? { ...prev, generationCredits: newBalance } : prev,
      ),
  };
}
