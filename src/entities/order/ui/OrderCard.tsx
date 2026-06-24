import Link from "next/link";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { formatOrderDate, formatPrice, itemThumb } from "../lib/presentation";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { OrderItemThumb, UserOrderListItem } from "../types";

interface OrderCardProps {
  order: UserOrderListItem;
}

// Imagen cuadrada y recortada de un item, uniforme para cualquier producto.
function ItemImage({
  item,
  className,
  iconSize,
}: {
  item: OrderItemThumb;
  className: string;
  iconSize: string;
}) {
  const thumb = itemThumb(item);
  return (
    <span
      className={`shrink-0 overflow-hidden rounded-xl bg-white ${className}`}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cloudinaryThumb(thumb, 480)}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <span className={`material-symbols-outlined text-text-muted ${iconSize}`}>
            image
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Resumen de una orden enlazado a su detalle. Destaca el producto principal de la
 * orden (imagen + nombre) con las miniaturas del resto, e indica estado y total.
 * Pensado para listarse en grilla en /user/orders.
 */
export function OrderCard({ order }: OrderCardProps) {
  const items = order.items ?? [];
  const itemCount = items.length;
  const primary = items[0];
  const rest = items.slice(1);

  return (
    <li>
      <Link
        href={`/user/orders/${order.id}`}
        className="group flex flex-col gap-4 rounded-xl bg-cream p-4 transition-all hover:shadow-md md:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-display text-base font-black text-text-main md:text-lg">
                Order {order.orderNumber}
              </p>
              <OrderStatusBadge order={order} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-text-muted">
              <span className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              {formatOrderDate(order.shopifyCreatedAt)}
              <span className="text-text-muted/50">·</span>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <span className="material-symbols-outlined shrink-0 text-[22px] text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-primary">
            chevron_right
          </span>
        </div>

        {primary && (
          <div className="flex items-center gap-4">
            <ItemImage
              item={primary}
              className="size-24 md:size-28"
              iconSize="text-[32px]"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-bold text-text-main">
                {primary.title}
              </p>
              {rest.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  {rest.slice(0, 3).map((item) => (
                    <ItemImage
                      key={item.id}
                      item={item}
                      className="size-10"
                      iconSize="text-[18px]"
                    />
                  ))}
                  {rest.length > 3 && (
                    <span className="text-xs font-bold text-text-muted">
                      +{rest.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E0DED9] pt-3">
          <span className="text-sm text-text-muted">Total</span>
          <span className="font-display text-lg font-black text-text-main">
            {formatPrice(order.totalAmount, order.currency)}
          </span>
        </div>
      </Link>
    </li>
  );
}
