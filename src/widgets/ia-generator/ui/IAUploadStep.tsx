"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

interface PetPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  photos?: PetPhoto[];
}

interface IAUploadStepProps {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  onPetSelect: (petId: string | null) => void;
  onNext: () => void;
}

const SPECIES_OPTIONS = ["dog", "cat", "bird", "rabbit", "other"];
const MAX_PHOTOS = 1;

export function IAUploadStep({
  photos,
  onPhotosChange,
  onPetSelect,
  onNext,
}: IAUploadStepProps) {
  const { get, post, authFetch, authFetchJSON } = useAuthFetch();

  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
  });

  useEffect(() => {
    get<unknown>("/pets")
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray((res as { data?: unknown }).data)
            ? ((res as { data: unknown[] }).data as Pet[])
            : [];
        setPets(list);
      })
      .catch(() => {});
  }, [get]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const addPhotos = useCallback(
    (incoming: File[]) => {
      const images = incoming.filter((f) => f.type.startsWith("image/"));
      onPhotosChange([...photos, ...images].slice(0, MAX_PHOTOS));
    },
    [photos, onPhotosChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addPhotos(Array.from(e.dataTransfer.files));
    },
    [addPhotos],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addPhotos(Array.from(e.target.files));
    e.target.value = "";
  };

  const selectPet = (pet: Pet) => {
    setActivePet(pet);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? "",
      age: pet.age != null ? String(pet.age) : "",
    });
    onPetSelect(pet.id);
    const primary =
      pet.photos?.find((p) => p.isPrimary) ?? pet.photos?.[0] ?? null;
    setExistingPhotoUrl(primary?.photoUrl ?? null);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadPhoto = async (petId: string) => {
    if (!photos[0]) return;
    const formData = new FormData();
    formData.append("photo", photos[0]);
    await authFetch(`/pets/${petId}/photos?isPrimary=true`, {
      method: "POST",
      body: formData,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isExistingPet && !form.name.trim()) {
      setFormError("Pet name is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (isExistingPet) {
        const raw = await authFetchJSON<{ data: Pet } | Pet>(
          `/pets/${activePet.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              species: form.species,
              breed: form.breed.trim() || undefined,
              age: form.age ? parseInt(form.age) : undefined,
            }),
          },
        );
        const updated = "data" in raw ? raw.data : raw;
        await uploadPhoto(activePet.id);
        setPets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setActivePet(updated);
        onNext();
      } else {
        const raw = await post<{ data: Pet } | Pet>("/pets", {
          name: form.name.trim(),
          species: form.species,
          breed: form.breed.trim() || undefined,
          age: form.age ? parseInt(form.age) : undefined,
        });
        const newPet = "data" in raw ? raw.data : raw;
        await uploadPhoto(newPet.id);
        setPets((prev) => [...prev, newPet]);
        setActivePet(newPet);
        setForm({
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed ?? "",
          age: newPet.age != null ? String(newPet.age) : "",
        });
        onPetSelect(newPet.id);
        onNext();
      }
    } catch {
      setFormError(
        isExistingPet
          ? "Could not update pet. Try again."
          : "Could not save pet. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isExistingPet = activePet !== null;
  const displayPhoto = previews[0] ?? existingPhotoUrl;

  return (
    <main className="grow flex items-center px-6 py-8 md:py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-stretch">
          {/* ── LEFT: Photo Upload ── */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-dark mb-4">
              Upload Pet Photo
            </h2>

            {/* Drop zone */}
            <div
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex-1 min-h-50 ${
                displayPhoto
                  ? ""
                  : `border-2 border-dashed flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5"
                    }`
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileInput}
              />

              {displayPhoto ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayPhoto}
                    alt="Pet photo"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-end pb-5 gap-1">
                    <span className="material-symbols-outlined text-white text-3xl">
                      photo_camera
                    </span>
                    <p className="text-white text-sm font-semibold tracking-wide">
                      Click to change photo
                    </p>
                  </div>

                  {/* Success badge */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-full pointer-events-none">
                    <span className="material-symbols-outlined text-green-400 text-[14px]">
                      check_circle
                    </span>
                    Photo ready
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPhotosChange([]);
                      setExistingPhotoUrl(null);
                    }}
                    className="absolute top-3 right-3 z-20 size-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <div
                    className={`size-14 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                      isDragging
                        ? "bg-primary text-white scale-110"
                        : "bg-slate-200 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {isDragging ? "download" : "add_a_photo"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">
                    {isDragging ? "Drop it here!" : "Click or drag & drop"}
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP · Max 10 MB
                  </p>
                </>
              )}
            </div>

            {!displayPhoto && (
              <p className="mt-3 text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-amber-400">
                  lightbulb
                </span>
                Good lighting and a clear face make the best results
              </p>
            )}
          </div>

          {/* ── RIGHT: Pet Details ── */}
          <div>
            <h2 className="text-xl font-bold text-slate-dark mb-4">
              Pet Details
            </h2>

            {isExistingPet && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  check_circle
                </span>
                <span className="text-sm font-semibold text-primary">
                  {activePet.name} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePet(null);
                    setForm({ name: "", species: "dog", breed: "", age: "" });
                    onPetSelect(null);
                    setExistingPhotoUrl(null);
                  }}
                  className="bg-white ml-auto text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Change
                </button>
              </div>
            )}

            <form id="pet-form" onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Pets
                </label>
                {pets.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      pets
                    </span>
                    <span>No pets yet.</span>
                  </div>
                ) : (
                  <select
                    value={activePet?.id ?? ""}
                    onChange={(e) => {
                      const pet = pets.find((p) => p.id === e.target.value);
                      if (pet) {
                        selectPet(pet);
                      } else {
                        setActivePet(null);
                        setForm({ name: "", species: "dog", breed: "", age: "" });
                        onPetSelect(null);
                        setExistingPhotoUrl(null);
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-shadow"
                  >
                    <option value="">— Select a pet —</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {`${p.name}${p.species ? ` (${p.species}${p.breed ? ` · ${p.breed}` : ""})` : ""}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!isExistingPet && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pet Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Buddy"
                    maxLength={100}
                    autoComplete="off"
                    className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Species
                </label>
                <select
                  name="species"
                  value={form.species}
                  onChange={handleFieldChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-shadow"
                >
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Breed
                </label>
                <input
                  name="breed"
                  value={form.breed}
                  onChange={handleFieldChange}
                  placeholder="e.g., Golden Retriever"
                  maxLength={100}
                  className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Age
                </label>
                <input
                  name="age"
                  value={form.age}
                  onChange={handleFieldChange}
                  type="number"
                  min={0}
                  max={50}
                  placeholder="e.g., 3"
                  className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                />
              </div>

              {formError && <p className="text-red-500 text-xs">{formError}</p>}
            </form>

            {(() => {
              const needsPhoto = photos.length === 0 && !existingPhotoUrl;
              const needsName = !isExistingPet && !form.name.trim();
              const disabled = needsPhoto || needsName || submitting;
              const hint =
                needsPhoto && needsName
                  ? "Upload a photo and enter a pet name to continue"
                  : needsPhoto
                    ? "Upload at least one photo to continue"
                    : needsName
                      ? "Enter a pet name to continue"
                      : null;

              return (
                <>
                  <button
                    type="submit"
                    form="pet-form"
                    disabled={disabled}
                    className={`mt-5 w-full font-bold py-3.5 rounded-xl text-base transition-all ${
                      disabled
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                  >
                    {submitting
                      ? "Saving..."
                      : isExistingPet
                        ? "Update & Continue"
                        : "Save & Continue"}
                  </button>
                  {hint && (
                    <p className="mt-2 text-xs text-slate-400 text-center">
                      {hint}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </main>
  );
}
