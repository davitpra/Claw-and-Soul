"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type {
  AccountUser,
  ApiEnvelope,
  UserProfile,
} from "@/entities/order/types";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardTabs } from "./DashboardTabs";

// Texto fijo del header por ruta. Se hace match por prefijo (salvo "/user", que
// es exacto) para cubrir subrutas como /user/pets/[id].
function headerCopy(
  pathname: string,
  firstName: string,
): { title: string; subtitle: string } {
  if (pathname.startsWith("/user/orders"))
    return {
      title: "Your orders",
      subtitle: "Track and review everything you've ordered.",
    };
  if (pathname.startsWith("/user/generations"))
    return {
      title: "Your artwork",
      subtitle: "All the pieces you've created with your pets.",
    };
  if (pathname.startsWith("/user/pbn"))
    return {
      title: "Paint by Numbers",
      subtitle: "Your saved paint-by-numbers templates, ready to order.",
    };
  if (pathname.startsWith("/user/pets"))
    return {
      title: "Your pets",
      subtitle: "The companions behind your art.",
    };
  if (pathname.startsWith("/user/profile"))
    return {
      title: "Profile & Settings",
      subtitle: "Update your name, email, and account details.",
    };
  // "/user" (Overview) y cualquier otra ruta caen aquí.
  return {
    title: `Welcome back, ${firstName}!`,
    subtitle:
      "Manage your orders, artworks, and account details all in one place.",
  };
}

// Vive en el layout de /user, así WelcomeHeader y DashboardTabs persisten al
// navegar entre las pestañas (Overview, Orders, Pets, …) en vez de remontarse
// con cada página.
export function DashboardHeader() {
  const { user } = useAuth();
  const { get } = useAuthFetch();
  const pathname = usePathname();

  // /auth/me (AuthContext) no incluye fullName; /users/me sí. Sembramos con lo
  // que ya hay en el contexto y lo completamos con el perfil real.
  const [profile, setProfile] = useState<AccountUser>({
    fullName: user?.fullName,
    email: user?.email,
    role: user?.role,
    avatarUrl: user?.avatarUrl,
  });

  useEffect(() => {
    let active = true;

    get<ApiEnvelope<UserProfile>>("/users/me")
      .then((res) => {
        if (active && res.data) {
          setProfile({
            fullName: res.data.fullName,
            email: res.data.email,
            role: res.data.role,
            avatarUrl: res.data.avatarUrl,
          });
        }
      })
      .catch(() => {
        /* keep AuthContext fallback */
      });

    return () => {
      active = false;
    };
  }, [get]);

  const firstName = profile.fullName?.trim().split(/\s+/)[0] || "Buddy";
  const { title, subtitle } = headerCopy(pathname, firstName);

  return (
    <Container className="py-12">
      <WelcomeHeader user={profile} title={title} subtitle={subtitle} />
      <div className="mt-8">
        <DashboardTabs />
      </div>
    </Container>
  );
}
