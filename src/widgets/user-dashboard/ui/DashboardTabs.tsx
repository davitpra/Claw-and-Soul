"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  label: string;
  icon: string;
  href: string;
}

const tabs: TabItem[] = [
  { label: "Overview", icon: "grid_view", href: "/user" },
  { label: "Orders", icon: "receipt_long", href: "/user/orders" },
  { label: "My Artwork", icon: "palette", href: "/user/generations" },
  { label: "My Pets", icon: "pets", href: "/user/pets" },
  { label: "Account", icon: "settings", href: "/user/profile" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto rounded-xl bg-white p-1">
      <div className="flex flex-nowrap gap-1">
        {tabs.map((tab) => {
          // "/user" sólo activo en match exacto; el resto cubre sus subrutas
          // (p. ej. /user/pets/[id] marca "My Pets").
          const isActive =
            tab.href === "/user"
              ? pathname === "/user"
              : pathname === tab.href ||
                pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-cream"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
