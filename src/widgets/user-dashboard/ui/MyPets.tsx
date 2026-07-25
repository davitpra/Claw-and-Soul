"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import type { UserPet } from "@/entities/order/types";
import LightRays from "@/shared/ui/LightRays";

interface Props {
  pets: UserPet[];
  isLoading: boolean;
  error: string | null;
}

// Devuelve la URL de la foto principal de la mascota (o la primera disponible).
function primaryPhotoUrl(pet: UserPet): string | null {
  const photos = pet.photos ?? [];
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return primary?.photoUrl ?? null;
}

export function MyPets({ pets, isLoading, error }: Props) {
  const visiblePets = pets.slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-black text-text-main">
          My Pets
        </h2>
        <Link
          href="/user/pets"
          className="text-sm font-bold text-primary hover:text-primary-dark"
        >
          View all
        </Link>
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {visiblePets.map((pet) => {
              const photoUrl = primaryPhotoUrl(pet);

              return (
                <Link
                  key={pet.id}
                  href={`/user/pets/${pet.id}`}
                  className="block overflow-hidden shadow-sm transition-all hover:shadow-md"
                >
                  {photoUrl ? (
                    <Card
                      imageUrl={cloudinaryThumb(photoUrl, 400)}
                      imageAlt={pet.name}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
                        <p className="truncate font-display text-sm font-bold text-white">
                          {pet.name}
                        </p>
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
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      {/* Rayos de luz decorativos; último hijo para pintar por encima de todo
                            el contenido (imagen incluida) sin bloquear clics. */}
      <LightRays />
    </section>
  );
}
