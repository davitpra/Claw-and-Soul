import Link from "next/link";

/**
 * Link de vuelta al listado de Paint by Numbers (`/user/pbn`). Espeja
 * `BackToGenerationsLink`, incluido el `gap-1` → `gap-2` en hover.
 */
export function BackToPbnLink() {
  return (
    <Link
      href="/user/pbn"
      className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2 hover:text-primary-dark"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      Back to my Paint by Numbers
    </Link>
  );
}
