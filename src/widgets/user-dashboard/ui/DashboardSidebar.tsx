"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  icon: string;
  href?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "grid_view", href: "/user" },
  { label: "Orders", icon: "receipt_long", href: "/user/orders" },
  { label: "My Artwork", icon: "palette", href: "/user/generations" },
  { label: "Addresses", icon: "location_on" },
  { label: "Payment Methods", icon: "credit_card" },
  { label: "Account Settings", icon: "settings", href: "/user/profile" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="rounded-xl border border-[#E0DED9] bg-white p-3 shadow-sm">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const baseClasses =
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all";
          const content = (
            <>
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </>
          );

          if (!item.href) {
            return (
              <button
                key={item.label}
                type="button"
                className={`${baseClasses} w-full text-left text-text-muted hover:bg-cream`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${baseClasses} ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-cream"
              }`}
            >
              {content}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition-all hover:bg-red-50"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Log out
        </button>
      </nav>
    </aside>
  );
}
