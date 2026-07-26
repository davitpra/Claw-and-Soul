"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { edgeMask, useScrollRail } from "@/hooks/useScrollRail";

interface TabItem {
  label: string;
  icon: string;
  href: string;
}

const tabs: TabItem[] = [
  { label: "Overview", icon: "grid_view", href: "/user" },
  { label: "Orders", icon: "receipt_long", href: "/user/orders" },
  { label: "My Artwork", icon: "palette", href: "/user/generations" },
  { label: "Paint by Numbers", icon: "format_paint", href: "/user/pbn" },
  { label: "My Pets", icon: "pets", href: "/user/pets" },
  { label: "Account", icon: "settings", href: "/user/profile" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  // El rail vive dentro de la tarjeta: la máscara sólo desvanece las pestañas,
  // el fondo blanco y las esquinas del <nav> quedan intactos.
  const {
    railRef,
    canScrollLeft,
    canScrollRight,
    syncEdges,
    dragHandlers,
    dragging,
    wasDragged,
  } = useScrollRail<HTMLDivElement>();

  // Al soltar tras arrastrar no se navega a la pestaña que quedó bajo el cursor.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (wasDragged()) event.preventDefault();
  };

  return (
    <nav className="rounded-xl bg-white p-1">
      <div
        ref={railRef}
        onScroll={syncEdges}
        {...dragHandlers}
        style={{
          maskImage: edgeMask(canScrollLeft, canScrollRight),
          WebkitMaskImage: edgeMask(canScrollLeft, canScrollRight),
        }}
        className={`flex select-none flex-nowrap gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {tabs.map((tab) => {
          // "/user" sólo activo en match exacto; el resto cubre sus subrutas
          // (p. ej. /user/pets/[id] marca "My Pets").
          const isActive =
            tab.href === "/user"
              ? pathname === "/user"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={handleClick}
              draggable={false}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-cream"
              }`}
            >
              {/* <span className="material-symbols-outlined text-[20px]">
                {tab.icon}
              </span> */}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
