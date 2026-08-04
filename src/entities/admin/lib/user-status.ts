import type { BadgeProps } from "@shopify/polaris";
import type { AdminUserStatus, UserActivityFilter } from "../api";

/**
 * Presentación del ciclo de vida de una cuenta. Centralizado aquí para que el
 * listado y la ficha nombren igual el mismo estado, y para no repetir el viejo
 * `isActive ? "Activo" : "Inactivo"`, que no distinguía una suspensión de una
 * baja por inactividad.
 */

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "Activo",
  banned: "Suspendido",
  inactive: "Inactivo",
  deleted: "Dado de baja",
};

const STATUS_TONES: Record<AdminUserStatus, BadgeProps["tone"]> = {
  active: "success",
  banned: "critical",
  inactive: "warning",
  deleted: "critical",
};

export function userStatusLabel(status: AdminUserStatus): string {
  return USER_STATUS_LABELS[status] ?? status;
}

export function userStatusTone(status: AdminUserStatus): BadgeProps["tone"] {
  return STATUS_TONES[status] ?? "enabled";
}

/** Opciones del filtro del listado. `all` incluye las cuentas dadas de baja. */
export const USER_STATUS_FILTER_OPTIONS: {
  label: string;
  value: AdminUserStatus | "all";
}[] = [
  { label: "Activos", value: "active" },
  { label: "Suspendidos", value: "banned" },
  { label: "Inactivos", value: "inactive" },
  { label: "Dados de baja", value: "deleted" },
  { label: "Todos", value: "all" },
];

/**
 * Opciones del filtro de recencia. Es un eje distinto del estado de la cuenta y
 * se combina con él: «dormido» habla de cuándo dio señales de vida, no de si
 * está suspendido.
 *
 * `3d` existe en el backend para los enlaces del dashboard, pero no se ofrece
 * aquí: es demasiado fino para elegirlo a mano.
 */
export const USER_ACTIVITY_FILTER_OPTIONS: {
  label: string;
  value: UserActivityFilter;
}[] = [
  { label: "Activos (7 días)", value: "7d" },
  { label: "Activos (30 días)", value: "30d" },
  { label: "Activos (90 días)", value: "90d" },
  { label: "Dormidos (+90 días)", value: "dormant" },
  { label: "Nunca activaron", value: "never" },
];

const ACTIVITY_LABELS = new Map(
  USER_ACTIVITY_FILTER_OPTIONS.map((o) => [o.value, o.label]),
);

/** Etiqueta del chip del filtro aplicado; cubre también el `3d` no listado. */
export function userActivityLabel(value: UserActivityFilter): string {
  return ACTIVITY_LABELS.get(value) ?? "Activos (3 días)";
}

export function isUserActivityFilter(
  value: unknown,
): value is UserActivityFilter {
  return (
    value === "3d" ||
    USER_ACTIVITY_FILTER_OPTIONS.some((o) => o.value === value)
  );
}

/**
 * Explicación del efecto de cada estado, para el banner de la ficha. El admin
 * necesita saber si el usuario puede volver a entrar por su cuenta o no.
 */
export const USER_STATUS_EFFECT: Record<AdminUserStatus, string> = {
  active: "La cuenta funciona con normalidad.",
  banned:
    "No puede iniciar sesión ni renovar su sesión. Solo un admin puede reactivarla.",
  inactive:
    "Desactivada por falta de uso. Se reactiva sola en cuanto el usuario vuelva a iniciar sesión.",
  deleted:
    "Sin acceso. Sus datos personales se borran automáticamente 30 días después de la baja.",
};
