import type { SelectedProductInfo } from "../IAProductStep";

export interface PetPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  photos?: PetPhoto[];
}

export interface PetForm {
  name: string;
  species: string;
  breed: string;
  age: string;
}

export interface IAUploadStepProps {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  styleId: string | null;
  productRefId: string | null;
  formatId: string | null;
  onNext: () => void;
  productInfo: SelectedProductInfo | null;
  styleName: string | null;
  userSelections?: Record<string, string | number>;
}

export const SPECIES_OPTIONS = ["dog", "cat", "bird", "rabbit", "other"];
export const MAX_PHOTOS = 4;
export const EMPTY_FORM: PetForm = {
  name: "",
  species: "dog",
  breed: "",
  age: "",
};

export function petToForm(pet: Pet): PetForm {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? "",
    age: pet.age != null ? String(pet.age) : "",
  };
}

export function primaryPhotoOf(pet: Pet): PetPhoto | null {
  return pet.photos?.find((p) => p.isPrimary) ?? pet.photos?.[0] ?? null;
}

// Todas las fotos de la mascota, con la principal primero.
export function orderedPhotos(pet: Pet): PetPhoto[] {
  return [...(pet.photos ?? [])].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
}
