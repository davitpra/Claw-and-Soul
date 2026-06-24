import Link from "next/link";

/**
 * Link de vuelta al listado de órdenes (`/user/orders`). La flecha se separa
 * en hover (`gap-1` → `gap-2`), patrón estándar de los links con icono del repo.
 */
export function BackToOrdersLink() {
  return (
    <Link
      href="/user/orders"
      className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2 hover:text-primary-dark"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      Back to orders
    </Link>
  );
}
