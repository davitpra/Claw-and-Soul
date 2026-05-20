"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", exact: true },
  { label: "Usuarios", href: "/admin/users", icon: "group" },
  { label: "Pedidos", href: "/admin/orders", icon: "shopping_bag" },
  { label: "Estilos", href: "/admin/styles", icon: "palette" },
  { label: "Formatos", href: "/admin/formats", icon: "aspect_ratio" },
  { label: "Productos & Sync", href: "/admin/products", icon: "inventory_2" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-60 shrink-0 flex flex-col min-h-screen bg-background-dark text-white">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center justify-center gap-2.5">
          <h2 className="text-white text-xl lg:text-2xl font-bold leading-tight tracking-[-0.015em] text-center">
            Claw <span className="text-primary">&</span> Soul
          </h2>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
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
                  ? "bg-primary text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin card */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">
              admin_panel_settings
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.fullName || user?.email || "Admin"}
            </p>
            <p className="text-[11px] text-white/40">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
