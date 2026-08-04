"use client";

import { notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "./_components/AdminSidebar";
import PolarisProvider from "./PolarisProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAuth();

  // El spinner va primero a propósito: sin él, el 404 parpadearía mientras
  // AuthContext todavía está resolviendo la sesión.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#e3e3e3] border-t-[#448da6] animate-spin" />
      </div>
    );
  }

  // 404 en vez de redirigir a "/": así la ruta no delata que existe. Va en el
  // render, no en un useEffect, porque notFound() funciona lanzando. La
  // autorización real sigue siendo del backend en cada endpoint /admin/*.
  if (!isAdmin) notFound();

  return (
    <PolarisProvider>
      <div className="flex min-h-screen w-full bg-[#f4f6f8] font-body">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-800 mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </PolarisProvider>
  );
}
