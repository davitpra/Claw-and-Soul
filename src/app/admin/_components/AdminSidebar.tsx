"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Icon } from "@shopify/polaris";
import {
  HomeIcon,
  TeamIcon,
  OrderIcon,
  PaintBrushFlatIcon,
  ColorIcon,
  InventoryIcon,
  ReceiptIcon,
} from "@shopify/polaris-icons";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon, exact: true },
  { label: "Pedidos", href: "/admin/orders", icon: OrderIcon },
  { label: "Productos", href: "/admin/products", icon: InventoryIcon },
  { label: "Estilos", href: "/admin/styles", icon: PaintBrushFlatIcon },
  { label: "PBN", href: "/admin/pbn", icon: ColorIcon },
  // Los créditos ya no son una sección propia: se ven y se acreditan desde la
  // lista de usuarios, y su historial vive en /admin/credits/[id].
  { label: "Usuarios", href: "/admin/users", icon: TeamIcon },
  { label: "Gastos", href: "/admin/expenses", icon: ReceiptIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <aside className="w-60 shrink-0 flex flex-col min-h-screen bg-white border-r border-[#e3e3e3]">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-[#e3e3e3] flex items-center justify-center">
        <Link
          href="/admin"
          className="group flex items-center gap-2.5 no-underline text-text-main hover:opacity-80 transition-opacity"
        >
          <Image
            src="/Logo.svg"
            alt="Claw & Soul Logo"
            width={20}
            height={20}
            priority
            className="size-9 shrink-0 transition-transform group-hover:scale-105"
          />
          {/* <span> y no <h2>: el reset sin capa de Polaris fuerza
              font-size:1em/font-weight:regular en headings y gana sobre las
              utilidades de Tailwind, que sí están en @layer. */}
          <span className="font-display text-text-main text-xl font-black leading-tight tracking-[-0.015em] whitespace-nowrap">
            Claw & Soul
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg no-underline text-[13px] mb-0.5 border-l-[3px] transition-colors duration-120 ${
                isActive
                  ? "font-semibold text-[#448da6] bg-[#e8f3f6] border-l-[#448da6]"
                  : "font-normal text-[#202223] bg-transparent border-l-transparent"
              }`}
            >
              <span
                className={`flex shrink-0 ${
                  isActive ? "text-[#448da6]" : "text-[#5c5f62]"
                }`}
              >
                <Icon source={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin card */}
      <div className="px-3 pt-3 pb-4">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#f6f6f7] border border-[#e3e3e3]">
          <Avatar
            size="sm"
            initials={initials}
            name={user?.fullName ?? "Admin"}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#202223] truncate m-0">
              {user?.fullName || user?.email || "Admin"}
            </p>
            <p className="text-[11px] text-[#6d7175] m-0">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
