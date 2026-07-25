"use client";

import { useEffect, useState } from "react";
import { Container } from "@/shared/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type {
  AccountUser,
  Address,
  ApiEnvelope,
  DefaultAddressResponse,
  PaginatedResult,
  UserGeneration,
  UserOrderListItem,
  UserPet,
  UserProfile,
} from "@/entities/order/types";
import { RecentOrders } from "./RecentOrders";
import { MyArtworks } from "./MyArtworks";
import { MyPets } from "./MyPets";
import { AccountDetails } from "./AccountDetails";

export function UserDashboard() {
  const { user } = useAuth();
  const { get } = useAuthFetch();

  // /auth/me (AuthContext) no incluye fullName; /users/me sí. Sembramos con lo
  // que ya hay en el contexto y lo completamos con el perfil real.
  const [profile, setProfile] = useState<AccountUser>({
    fullName: user?.fullName,
    email: user?.email,
    role: user?.role,
  });

  const [orders, setOrders] = useState<UserOrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [artworks, setArtworks] = useState<UserGeneration[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [artworksError, setArtworksError] = useState<string | null>(null);

  const [pets, setPets] = useState<UserPet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState<string | null>(null);

  const [address, setAddress] = useState<Address | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    let active = true;

    get<ApiEnvelope<UserProfile>>("/users/me")
      .then((res) => {
        if (active && res.data) {
          setProfile({
            fullName: res.data.fullName,
            email: res.data.email,
            role: res.data.role,
          });
        }
      })
      .catch(() => {
        /* keep AuthContext fallback */
      });

    get<ApiEnvelope<PaginatedResult<UserOrderListItem>>>("/orders?limit=5")
      .then((res) => {
        if (active) setOrders(res.data?.data ?? []);
      })
      .catch(() => {
        if (active) setOrdersError("Couldn't load your orders.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    get<ApiEnvelope<PaginatedResult<UserGeneration>>>(
      "/generations?limit=4&status=completed",
    )
      .then((res) => {
        if (active) setArtworks(res.data?.data ?? []);
      })
      .catch(() => {
        if (active) setArtworksError("Couldn't load your artworks.");
      })
      .finally(() => {
        if (active) setArtworksLoading(false);
      });

    get<ApiEnvelope<UserPet[]>>("/pets")
      .then((res) => {
        if (active) setPets(res.data ?? []);
      })
      .catch(() => {
        if (active) setPetsError("Couldn't load your pets.");
      })
      .finally(() => {
        if (active) setPetsLoading(false);
      });

    get<ApiEnvelope<DefaultAddressResponse>>("/orders/default-address")
      .then((res) => {
        if (active) setAddress(res.data?.address ?? null);
      })
      .catch(() => {
        if (active) setAddress(null);
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });

    return () => {
      active = false;
    };
  }, [get]);

  return (
    <>
      <Container className="pb-10">
        <div className="space-y-8">
          <MyArtworks
            artworks={artworks}
            isLoading={artworksLoading}
            error={artworksError}
          />
          <MyPets pets={pets} isLoading={petsLoading} error={petsError} />
          <RecentOrders
            orders={orders}
            isLoading={ordersLoading}
            error={ordersError}
          />
          <AccountDetails
            user={profile}
            address={address}
            isLoading={addressLoading}
          />
        </div>
      </Container>
    </>
  );
}
