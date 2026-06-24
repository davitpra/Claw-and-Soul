/**
 * Máquina de estados de producción por item del pedido (admin).
 * Define qué transiciones manuales se ofrecen desde cada estado y desde
 * cuáles todavía se puede cancelar un item.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["in_production", "cancelled", "refunded"],
  paid: ["in_production", "cancelled", "refunded"],
  in_production: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

/** Estados de producción desde los que un item aún puede cancelarse (no enviado). */
export const CANCELLABLE_STATUSES = ["pending", "paid", "in_production"];
