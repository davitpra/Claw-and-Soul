/**
 * Presentación de las filas de `AuditLog`. Las claves son los valores de
 * `AUDIT_ACTION` del backend (`src/common/constants/audit-actions.ts`).
 */

import type { BadgeProps } from "@shopify/polaris";

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "user.banned": "Cuenta suspendida",
  "user.reactivated": "Cuenta reactivada",
  "user.deactivated": "Cuenta desactivada",
  "user.deactivated_inactivity": "Desactivada por inactividad",
  "user.soft_deleted": "Cuenta dada de baja",
  "user.restored": "Cuenta restaurada",
  "user.anonymized": "Datos personales borrados",
  "user.session_revoked": "Sesión revocada",
  "user.sessions_revoked_all": "Todas las sesiones cerradas",
};

/**
 * El fallback devuelve la acción cruda en vez de "Desconocido": si mañana se
 * audita algo nuevo, la pestaña lo muestra igual aunque falte la traducción.
 */
export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

const AUDIT_ACTION_TONES: Record<string, BadgeProps["tone"]> = {
  "user.banned": "critical",
  "user.soft_deleted": "critical",
  "user.anonymized": "critical",
  "user.deactivated": "warning",
  "user.deactivated_inactivity": "warning",
  "user.session_revoked": "warning",
  "user.sessions_revoked_all": "warning",
  "user.reactivated": "success",
  "user.restored": "success",
};

export function auditActionTone(action: string): BadgeProps["tone"] {
  return AUDIT_ACTION_TONES[action] ?? "info";
}
