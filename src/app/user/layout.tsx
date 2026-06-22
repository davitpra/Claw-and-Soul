"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { DashboardHeader } from "@/widgets/user-dashboard";
import { useAuth } from "@/context/AuthContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Red de seguridad: redirige a /login si tras cargar la sesión no es válida.
  // Las páginas con datos server-side (p. ej. /user/pets) ya validan en el
  // servidor y redirigen ahí; esto cubre al resto.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // No bloqueamos el render detrás de isLoading: así el HTML SSR (o el shell)
  // pinta de inmediato sin esperar el /auth/me del cliente.
  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-text-main">
      <Navbar />
      <main className="flex-1">
        <DashboardHeader />
        {children}
      </main>
      <Footer />
    </div>
  );
}
