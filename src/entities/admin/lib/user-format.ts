/**
 * Helpers de presentación de usuarios en el admin.
 * Centralizados para que la lista (`app/admin/users`), el detalle
 * (`app/admin/users/[id]`) y los movimientos de créditos
 * (`app/admin/credits/[id]`) muestren la misma identidad para un mismo usuario.
 */

/**
 * Iniciales para el `<Avatar>`: dos letras del nombre cuando lo hay (nombre +
 * apellido si vienen ambos), y si no, las dos primeras del email.
 */
export function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/** Handle legible a partir del email: `ana@correo.com` → `@ana`. */
export function getHandle(email: string): string {
  return "@" + email.split("@")[0];
}

/** Tonos del `<Badge>` de rol. Cualquier rol desconocido cae en el neutro. */
const ROLE_TONES: Record<string, "attention" | "warning" | "info"> = {
  admin: "attention",
  premium: "warning",
  user: "info",
};

export function roleBadgeTone(
  role: string,
): "attention" | "warning" | "info" | "enabled" {
  return ROLE_TONES[role] ?? "enabled";
}

/**
 * Fecha absoluta con hora. Es el complemento de `fmtRelativeTime`: la lista la
 * usa en el tooltip y el detalle la muestra directamente.
 */
export function fmtAbsoluteDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Días transcurridos desde una fecha; para la tarjeta de estadísticas. */
export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/**
 * Antigüedad en lenguaje natural para columnas de actividad. Pasada una semana
 * deja de ser útil el "hace N días" y se muestra la fecha corta.
 */
export function fmtRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}
