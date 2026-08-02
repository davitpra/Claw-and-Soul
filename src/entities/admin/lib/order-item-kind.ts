import { AdminOrderItem } from "../api";

/**
 * Tipo de item de un pedido de cara al admin. `OrderItem` no lo guarda: se deriva
 * del `ProductReference` de la línea, igual que `productIntent()` en el catálogo.
 *
 * Solo el arte pasa por el flujo de producción (generación, Print Studio, PBN);
 * los accesorios se producen/envían sin arte y los créditos no se producen.
 */
export type OrderItemKind = "art" | "accessory" | "credits";

export function orderItemKind(item: AdminOrderItem): OrderItemKind {
  const ref = item.productRef;
  // creditAmount solo llega cuando la variante comprada está mapeada al pack, así
  // que manda sobre las flags del producto.
  if (
    item.creditAmount != null ||
    ref?.isCreditPack ||
    ref?.template === "Credits"
  ) {
    return "credits";
  }
  if (ref?.isAccessory || ref?.template === "Accessory") return "accessory";
  return "art";
}
