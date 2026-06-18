import { cookies } from "next/headers";
import type { ApiEnvelope, UserPet } from "@/entities/order/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Resultado de un fetch server-side: o trae datos, o indica que la sesión no es
// válida (para que la página decida el redirect a /login).
export type ServerFetchResult<T> =
  | { data: T; unauthorized: false }
  | { data: null; unauthorized: true };

/**
 * Reenvía las cookies de auth (httpOnly) al backend desde un Server Component.
 * Sigue el patrón documentado en `src/lib/auth/README.md`.
 */
async function buildCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  return [
    accessToken && `accessToken=${accessToken}`,
    refreshToken && `refreshToken=${refreshToken}`,
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Obtiene las mascotas del usuario en el servidor para hidratar la página sin
 * round-trips en cliente. Devuelve `unauthorized: true` ante 401/403 o cookie
 * ausente para que la página redirija a /login.
 */
export async function getPetsServer(): Promise<ServerFetchResult<UserPet[]>> {
  const cookie = await buildCookieHeader();

  if (!cookie) {
    return { data: null, unauthorized: true };
  }

  try {
    const res = await fetch(`${API_URL}/pets`, {
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return { data: null, unauthorized: true };
    }

    if (!res.ok) {
      // Errores no relacionados con auth: no redirigimos, dejamos lista vacía
      // y el cliente puede reintentar.
      return { data: [], unauthorized: false };
    }

    const envelope = (await res.json()) as ApiEnvelope<UserPet[]>;
    return { data: envelope.data ?? [], unauthorized: false };
  } catch {
    // Backend inalcanzable: degradamos a lista vacía sin tumbar el render.
    return { data: [], unauthorized: false };
  }
}
