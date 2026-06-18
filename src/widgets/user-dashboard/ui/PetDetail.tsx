"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type { ApiEnvelope, UserPet, UserPetPhoto } from "@/entities/order/types";

const MAX_PHOTOS = 4;

interface Props {
  petId: string;
}

// Ordena las fotos dejando la principal primero.
function orderedPhotos(pet: UserPet) {
  const photos = pet.photos ?? [];
  return [...photos].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

export function PetDetail({ petId }: Props) {
  const { get, delete: del, authFetchJSON } = useAuthFetch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pet, setPet] = useState<UserPet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserPetPhoto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    get<ApiEnvelope<UserPet>>(`/pets/${petId}`)
      .then((res) => {
        if (!active) return;
        const data = res.data ?? null;
        setPet(data);
        if (data) {
          const photos = orderedPhotos(data);
          setActivePhoto(photos[0]?.photoUrl ?? null);
        }
      })
      .catch(() => {
        if (active) setError("Couldn't load this pet.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [get, petId]);

  async function handleUploadPhoto(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const isPrimary = (pet?.photos ?? []).length === 0;
      const raw = await authFetchJSON<ApiEnvelope<UserPetPhoto>>(
        `/pets/${petId}/photos?isPrimary=${isPrimary}`,
        { method: "POST", body: formData },
      );
      const newPhoto = raw.data;
      setPet((prev) => {
        if (!prev) return prev;
        return { ...prev, photos: [...(prev.photos ?? []), newPhoto] };
      });
      setActivePhoto((current) => current ?? newPhoto.photoUrl);
    } catch (err) {
      console.error("Photo upload error:", err);
      setUploadError(
        err instanceof Error ? err.message : "Couldn't upload photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setDeletingId(photoId);
    setDeleteError(null);

    try {
      await del(`/pets/${petId}/photos/${photoId}`);

      setPet((prev) => {
        if (!prev) return prev;
        const remaining = (prev.photos ?? []).filter((p) => p.id !== photoId);
        const next = { ...prev, photos: remaining };
        const ordered = orderedPhotos(next);
        setActivePhoto((current) =>
          current && remaining.some((p) => p.photoUrl === current)
            ? current
            : ordered[0]?.photoUrl ?? null,
        );
        return next;
      });
      setPendingDelete(null);
    } catch {
      setDeleteError("Couldn't delete this photo. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-xl bg-white p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1fr]">
          <div className="aspect-4/5 animate-pulse rounded-xl bg-cream" />
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded-xl bg-cream" />
            <div className="h-4 w-1/3 animate-pulse rounded-xl bg-cream" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-cream" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !pet) {
    return (
      <section className="rounded-xl bg-white p-8">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Pet not found."}
        </p>
        <Link
          href="/user/pets"
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to My Pets
        </Link>
      </section>
    );
  }

  const photos = orderedPhotos(pet);
  const details = [pet.breed, pet.species].filter(Boolean).join(" · ");

  return (
    <section className="rounded-xl bg-white p-8">
      <Link
        href="/user/pets"
        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to My Pets
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 max-w-3xl mx-auto">
        {/* Detalles */}
        <div>
          <h1 className="font-display text-3xl font-black text-text-main">
            {pet.name}
          </h1>
          {details && (
            <p className="mt-1 capitalize text-text-muted">{details}</p>
          )}

          <dl className="mt-6 space-y-4 max-w-md">
            <div className="flex justify-between border-b border-[#E0DED9] pb-3">
              <dt className="text-text-muted">Species</dt>
              <dd className="font-bold capitalize text-text-main">
                {pet.species}
              </dd>
            </div>
            {pet.breed && (
              <div className="flex justify-between border-b border-[#E0DED9] pb-3">
                <dt className="text-text-muted">Breed</dt>
                <dd className="font-bold capitalize text-text-main">
                  {pet.breed}
                </dd>
              </div>
            )}
            {pet.age != null && (
              <div className="flex justify-between border-b border-[#E0DED9] pb-3">
                <dt className="text-text-muted">Age</dt>
                <dd className="font-bold text-text-main">
                  {pet.age} {pet.age === 1 ? "year" : "years"}
                </dd>
              </div>
            )}
          </dl>

          {pet.description && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-black text-text-main">
                About {pet.name}
              </h2>
              <p className="mt-2 text-text-muted">{pet.description}</p>
            </div>
          )}
        </div>
        {/* Galería */}
        <div>
          {activePhoto ? (
            <Card imageUrl={cloudinaryThumb(activePhoto, 800)} imageAlt={pet.name} />
          ) : (
            <div className="flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-xl bg-cream">
              <span className="material-symbols-outlined text-[48px] text-text-muted">
                pets
              </span>
              <p className="text-text-muted">No photos yet.</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-4 gap-3">
            {photos.map((photo) => {
              const isActive = photo.photoUrl === activePhoto;
              return (
                <div key={photo.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setActivePhoto(photo.photoUrl)}
                    className={`block aspect-square w-full overflow-hidden rounded-xl bg-cover bg-center transition-all ${
                      isActive
                        ? "ring-2 ring-primary"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      backgroundImage: `url('${cloudinaryThumb(photo.photoUrl, 200)}')`,
                    }}
                    aria-label={`View photo of ${pet.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(photo);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Delete photo of ${pet.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                </div>
              );
            })}

            {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
              <button
                key={`placeholder-${i}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-[#E0DED9] text-text-muted transition-all hover:border-primary hover:text-primary disabled:opacity-60"
                aria-label="Upload photo"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {uploading && i === 0 ? "progress_activity" : "add_a_photo"}
                </span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadPhoto(file);
              e.target.value = "";
            }}
          />

          {uploadError && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-title"
          onClick={() => deletingId === null && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="aspect-4/5 w-full rounded-xl bg-cover bg-center"
              style={{
                backgroundImage: `url('${cloudinaryThumb(pendingDelete.photoUrl, 400)}')`,
              }}
            />
            <h2
              id="delete-photo-title"
              className="mt-5 font-display text-lg font-bold text-text-main"
            >
              Delete this photo?
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              This action can&apos;t be undone.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId !== null}
                className="rounded-xl border border-[#E0DED9] bg-white px-4 py-2 text-sm font-bold text-text-main transition-all hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePhoto(pendingDelete.id)}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
                {deletingId !== null ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
