"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Resumen", href: "/admin", icon: "dashboard", exact: true },
  { label: "Estilos", href: "/admin/styles", icon: "palette" },
  { label: "Formatos", href: "/admin/formats", icon: "aspect_ratio" },
  { label: "Productos & Sync", href: "/admin/products", icon: "inventory_2" },
  { label: "Usuarios", href: "/admin/users", icon: "group" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-1 pr-4 border-r border-slate-dark/10 min-h-full">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted px-3 pt-2 pb-3">
        Administración
      </p>
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-text-main hover:bg-slate-dark/5 hover:text-slate-dark"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
