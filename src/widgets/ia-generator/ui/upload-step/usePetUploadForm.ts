"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useCredits } from "@/hooks/useCredits";
import { useCart } from "@/context/CartContext";
import { normalizeTemplate } from "@/entities/product/lib/template";
import {
  EMPTY_FORM,
  petToForm,
  primaryPhotoOf,
  orderedPhotos,
  type Pet,
  type PetPhoto,
  type PetForm,
  type IAUploadStepProps,
} from "./types";

// Desempaqueta respuestas que pueden venir envueltas en { data } o planas.
function unwrap<T>(raw: { data: T } | T): T {
  return raw && typeof raw === "object" && "data" in raw
    ? (raw as { data: T }).data
    : (raw as T);
}

type UploadFormDeps = Pick<
  IAUploadStepProps,
  | "photos"
  | "styleId"
  | "productRefId"
  | "formatId"
  | "onNext"
  | "productInfo"
  | "styleName"
  | "userSelections"
>;

/**
 * Maneja las mascotas del usuario, el estado del formulario y el envío:
 * guarda/actualiza la mascota, sube las fotos y dispara la generación de IA.
 */
export function usePetUploadForm({
  photos,
  styleId,
  productRefId,
  formatId,
  onNext,
  productInfo,
  styleName,
  userSelections,
}: UploadFormDeps) {
  const { get, post, authFetchJSON } = useAuthFetch();
  const { generate } = useGenerateImage();
  const { balance: creditBalance, refresh: refreshCredits } = useCredits();
  const { addToCart } = useCart();

  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm>(EMPTY_FORM);
  // Fotos ya guardadas de la mascota seleccionada (principal primero).
  const [existingPhotos, setExistingPhotos] = useState<PetPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // true cuando el fallo fue por saldo de créditos agotado (402): muestra el CTA
  // "Buy credits" junto al error.
  const [outOfCredits, setOutOfCredits] = useState(false);

  const isExistingPet = activePet !== null;

  // Carga inicial de las mascotas del usuario desde el backend.
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

  const selectPet = useCallback((pet: Pet) => {
    setActivePet(pet);
    setForm(petToForm(pet));
    setExistingPhotos(orderedPhotos(pet));
  }, []);

  const resetPet = useCallback(() => {
    setActivePet(null);
    setForm(EMPTY_FORM);
    setExistingPhotos([]);
  }, []);

  // Quita una foto guardada solo de la vista (no la borra del backend).
  const removeExistingPhoto = useCallback((index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Marca una foto guardada como principal: la sube al backend y reordena
  // localmente (principal primero) en las fotos, la mascota activa y la lista.
  const makeExistingPrimary = useCallback(
    async (index: number) => {
      if (!activePet) return;
      const target = existingPhotos[index];
      if (!target || target.isPrimary) return;

      const reordered = existingPhotos
        .map((p) => ({ ...p, isPrimary: p.id === target.id }))
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

      const previous = existingPhotos;
      setExistingPhotos(reordered);
      setActivePet((prev) => (prev ? { ...prev, photos: reordered } : prev));
      setPets((prev) =>
        prev.map((p) =>
          p.id === activePet.id ? { ...p, photos: reordered } : p,
        ),
      );

      try {
        await authFetchJSON(`/pets/${activePet.id}/photos/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_primary: true }),
        });
      } catch {
        // Revierte si el backend falla.
        setExistingPhotos(previous);
        setActivePet((prev) => (prev ? { ...prev, photos: previous } : prev));
        setPets((prev) =>
          prev.map((p) =>
            p.id === activePet.id ? { ...p, photos: previous } : p,
          ),
        );
      }
    },
    [activePet, existingPhotos, authFetchJSON],
  );

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  // Sube todas las fotos en orden: la primera como principal (isPrimary=true) y
  // el resto como secundarias. Devuelve la foto principal para usar su id.
  const uploadPhotos = useCallback(
    async (petId: string): Promise<PetPhoto | null> => {
      if (photos.length === 0) return null;
      let primaryPhoto: PetPhoto | null = null;
      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();
        formData.append("photo", photos[i]);
        const raw = await authFetchJSON<{ data: PetPhoto } | PetPhoto>(
          `/pets/${petId}/photos?isPrimary=${i === 0}`,
          { method: "POST", body: formData },
        );
        const photo = unwrap(raw);
        if (i === 0) primaryPhoto = photo;
      }
      return primaryPhoto;
    },
    [photos, authFetchJSON],
  );

  // Crea o actualiza la mascota y devuelve { petId, petPhotoId }.
  const savePet = useCallback(async (): Promise<{
    petId: string;
    petPhotoId: string | null;
  }> => {
    const payload = {
      species: form.species,
      breed: form.breed.trim() || undefined,
      age: form.age ? parseInt(form.age) : undefined,
    };

    if (activePet) {
      const updated = unwrap(
        await authFetchJSON<{ data: Pet } | Pet>(`/pets/${activePet.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      const newPhoto = await uploadPhotos(activePet.id);
      const existingPrimary = primaryPhotoOf(activePet);
      setPets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setActivePet(updated);
      return {
        petId: activePet.id,
        petPhotoId: newPhoto?.id ?? existingPrimary?.id ?? null,
      };
    }

    const newPet = unwrap(
      await post<{ data: Pet } | Pet>("/pets", {
        name: form.name.trim(),
        ...payload,
      }),
    );
    const newPhoto = await uploadPhotos(newPet.id);
    setPets((prev) => [...prev, newPet]);
    setActivePet(newPet);
    setForm(petToForm(newPet));
    return { petId: newPet.id, petPhotoId: newPhoto?.id ?? null };
  }, [activePet, form, post, authFetchJSON, uploadPhotos]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setOutOfCredits(false);

      if (!isExistingPet && !form.name.trim()) {
        setFormError("Pet name is required.");
        return;
      }
      if (!styleId || !productRefId || !formatId) {
        setFormError(
          "Missing product or format info. Please start from the catalog link.",
        );
        return;
      }

      setSubmitting(true);
      try {
        const { petId, petPhotoId } = await savePet();

        const generation = await generate({
          petId,
          petPhotoId: petPhotoId ?? undefined,
          formatId,
          productRefId,
          userSelections:
            userSelections && Object.keys(userSelections).length > 0
              ? userSelections
              : undefined,
        });

        // La generación consumió 1 crédito: refrescamos el saldo del badge.
        void refreshCredits();

        // productInfo es null al llegar por URL sin pasar por IAProductStep
        // (deep link). La generación se dispara igual, pero se omite el carrito.
        // Digital (descarga gratuita; "PBN" legacy) tampoco va al carrito: no se
        // cobra ni debe disparar el order_bonus de +5 créditos en checkout.
        const isDigital =
          normalizeTemplate(productInfo?.template) === "Digital";
        if (productInfo && !isDigital) {
          try {
            addToCart({
              id: generation.id,
              variantId: productInfo.shopifyVariantId,
              name: productInfo.productTitle,
              size: productInfo.formatLabel,
              style: styleName ?? undefined,
              price: parseFloat(productInfo.price),
              quantity: 1,
              img: productInfo.productImage,
              generationId: generation.id,
            });
          } catch (cartErr) {
            console.error("addToCart failed:", cartErr);
          }
        }

        onNext();
      } catch (err) {
        // Surface the backend message (e.g. the 402 "out of credits" error)
        // when available, falling back to a generic one.
        const msg =
          err instanceof Error && err.message
            ? err.message
            : "Could not start generation. Try again.";
        setFormError(msg);
        // El 402 de créditos trae este mensaje del backend; muestra el CTA.
        setOutOfCredits(/out of generation credits/i.test(msg));
      } finally {
        setSubmitting(false);
      }
    },
    [
      isExistingPet,
      form,
      styleId,
      productRefId,
      formatId,
      savePet,
      generate,
      refreshCredits,
      userSelections,
      productInfo,
      styleName,
      addToCart,
      onNext,
    ],
  );

  return {
    pets,
    activePet,
    isExistingPet,
    form,
    existingPhotos,
    removeExistingPhoto,
    makeExistingPrimary,
    submitting,
    formError,
    outOfCredits,
    creditBalance,
    selectPet,
    resetPet,
    handleFieldChange,
    handleSubmit,
  };
}
