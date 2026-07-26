/**
 * Config JSON que el studio persiste junto a un PBN (ver `buildPbnConfig` en
 * `widgets/studio/model/useSavePbnFlow.ts`). Tipado laxo a propósito:
 * `input`/`render` reflejan los valores crudos de los hooks de opciones para
 * poder rehidratarlos al reabrir el PBN.
 *
 * Vive en `lib/` y no en una entidad porque lo consumen tanto el panel admin
 * como el dashboard de usuario.
 */
export interface PbnConfig {
  input?: Record<string, unknown>;
  render?: Record<string, unknown>;
  paper?: Record<string, unknown>;
  palette?: number[][];
}
