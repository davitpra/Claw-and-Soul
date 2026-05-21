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
  LayoutColumns3Icon,
  InventoryIcon,
} from "@shopify/polaris-icons";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon, exact: true },
  { label: "Usuarios", href: "/admin/users", icon: TeamIcon },
  { label: "Pedidos", href: "/admin/orders", icon: OrderIcon },
  { label: "Estilos", href: "/admin/styles", icon: PaintBrushFlatIcon },
  { label: "Formatos", href: "/admin/formats", icon: LayoutColumns3Icon },
  { label: "Productos & Sync", href: "/admin/products", icon: InventoryIcon },
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
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e3e3e3",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #e3e3e3",
        }}
      >
        <Link
          href="/admin"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#448da6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#202223",
                  lineHeight: 1.2,
                  display: "block",
                }}
              >
                Claw{" "}
                <span style={{ color: "#448da6" }}>&amp;</span>{" "}
                Soul
              </span>
              <span
                style={{ fontSize: 11, color: "#6d7175", display: "block" }}
              >
                Admin
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px" }}>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#448da6" : "#202223",
                backgroundColor: isActive ? "#e8f3f6" : "transparent",
                marginBottom: 2,
                transition: "background 0.12s, color 0.12s",
                borderLeft: isActive ? "3px solid #448da6" : "3px solid transparent",
              }}
            >
              <span
                style={{
                  color: isActive ? "#448da6" : "#5c5f62",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <Icon source={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin card */}
      <div style={{ padding: "12px 12px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            backgroundColor: "#f6f6f7",
            border: "1px solid #e3e3e3",
          }}
        >
          <Avatar size="sm" initials={initials} name={user?.fullName ?? "Admin"} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#202223",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {user?.fullName || user?.email || "Admin"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#6d7175",
                margin: 0,
              }}
            >
              Administrador
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
