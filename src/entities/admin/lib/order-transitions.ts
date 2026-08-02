import { OrderItemKind } from "./order-item-kind";

/**
 * Máquina de estados de producción por item del pedido (admin).
 * Define qué transiciones manuales se ofrecen desde cada estado y desde
 * cuáles todavía se puede cancelar un item.
 *
 * Espejo de `backend/src/orders/production-status.util.ts`. Los estados
 * tempranos (`pending`/`generating`/`art_failed`/`draft`) los auto-asigna el
 * backend desde pago + generación; desde `draft` el admin avanza a mano.
 */

/** Flujo de arte, y default del resto de tipos. */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["cancelled", "refunded"],
  generating: ["cancelled", "refunded"],
  art_failed: ["cancelled", "refunded"],
  draft: ["pre_production", "on_hold", "cancelled", "refunded"],
  pre_production: ["in_production", "on_hold", "cancelled", "refunded"],
  in_production: ["printed", "on_hold", "cancelled", "refunded"],
  printed: ["shipped", "on_hold", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded", "restocked"],
  on_hold: ["pre_production", "in_production", "cancelled", "refunded"],
  cancelled: [],
  refunded: [],
  restocked: [],
};

/**
 * Flujo de accesorio (kit, pinceles): no se genera ni se imprime nada, así que
 * de `draft` (por preparar) se pasa directo a `shipped`.
 *
 * `pre_production`/`in_production`/`printed` solo figuran como origen: son
 * estados a los que un accesorio pudo avanzar con la máquina anterior y se les
 * deja salida hacia `shipped`.
 */
export const ACCESSORY_VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["cancelled", "refunded"],
  generating: ["cancelled", "refunded"],
  art_failed: ["cancelled", "refunded"],
  draft: ["shipped", "on_hold", "cancelled", "refunded"],
  pre_production: ["shipped", "on_hold", "cancelled", "refunded"],
  in_production: ["shipped", "on_hold", "cancelled", "refunded"],
  printed: ["shipped", "on_hold", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded", "restocked"],
  on_hold: ["draft", "cancelled", "refunded"],
  cancelled: [],
  refunded: [],
  restocked: [],
};

/** Transiciones ofrecidas para un item según su tipo. */
export function transitionsFor(status: string, kind: OrderItemKind): string[] {
  const map =
    kind === "accessory" ? ACCESSORY_VALID_TRANSITIONS : VALID_TRANSITIONS;
  return map[status] ?? [];
}

/** Estados de producción desde los que un item aún puede cancelarse (no enviado). */
export const CANCELLABLE_STATUSES = [
  "pending",
  "generating",
  "art_failed",
  "draft",
  "pre_production",
  "in_production",
  "printed",
];
