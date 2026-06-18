"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type { ApiEnvelope, UserPet } from "@/entities/order/types";

// Devuelve la URL de la foto principal de la mascota (o la primera disponible).
function primaryPhotoUrl(pet: UserPet): string | null {
  const photos = pet.photos ?? [];
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return primary?.photoUrl ?? null;
}

function petDetails(pet: UserPet): string {
  return [pet.breed, pet.species].filter(Boolean).join(" · ");
}

interface Props {
  // Mascotas obtenidas en servidor (SSR). Si vienen, evitamos el fetch cliente.
  initialPets?: UserPet[];
}

export function AllPets({ initialPets }: Props) {
  const { get } = useAuthFetch();

  const [pets, setPets] = useState<UserPet[]>(initialPets ?? []);
  const [isLoading, setIsLoading] = useState(initialPets == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Con datos del servidor no hacemos round-trip en cliente.
    if (initialPets != null) return;

    let active = true;

    get<ApiEnvelope<UserPet[]>>("/pets")
      .then((res) => {
        if (active) setPets(res.data ?? []);
      })
      .catch(() => {
        if (active) setError("Couldn't load your pets.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [get, initialPets]);

  return (
    <section className="rounded-xl bg-white p-8">
      <h1 className="font-display text-2xl font-bold text-text-main">My Pets</h1>
      <p className="mt-2 text-text-muted">
        All the pets you&apos;ve added to your account.
      </p>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-4/5 animate-pulse rounded-xl bg-cream"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!isLoading && !error && pets.length === 0 && (
          <div className="rounded-xl bg-cream px-4 py-8 text-center">
            <p className="text-text-muted">No pets yet.</p>
          </div>
        )}

        {!isLoading && !error && pets.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pets.map((pet) => {
              const photoUrl = primaryPhotoUrl(pet);
              const details = petDetails(pet);

              return (
                <Link
                  key={pet.id}
                  href={`/user/pets/${pet.id}`}
                  className="block overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md"
                >
                  {photoUrl ? (
                    <Card imageUrl={cloudinaryThumb(photoUrl, 400)} imageAlt={pet.name}>
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
                        <p className="truncate font-display text-sm font-bold text-white">
                          {pet.name}
                        </p>
                        {details && (
                          <p className="truncate text-xs capitalize text-white/80">
                            {details}
                          </p>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div className="flex aspect-4/5 flex-col items-center justify-center gap-2 bg-cream">
                      <span className="material-symbols-outlined text-[32px] text-text-muted">
                        pets
                      </span>
                      <p className="truncate px-2 font-display text-sm font-bold text-text-main">
                        {pet.name}
                      </p>
                      {details && (
                        <p className="truncate px-2 text-xs capitalize text-text-muted">
                          {details}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
