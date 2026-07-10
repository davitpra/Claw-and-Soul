"use client";

import { usePhotoManager } from "./upload-step/usePhotoManager";
import { usePetUploadForm } from "./upload-step/usePetUploadForm";
import { PhotoUploadPanel } from "./upload-step/PhotoUploadPanel";
import { PetDetailsForm } from "./upload-step/PetDetailsForm";
import type { IAUploadStepProps } from "./upload-step/types";
import { useAuth } from "@/context/AuthContext";

const PET_FORM_ID = "pet-form";

/**
 * Primer paso del flujo de generación de IA.
 *
 * Permite subir fotos de la mascota (o reusar una existente) y editar sus
 * datos. Al continuar, guarda/actualiza la mascota, sube las fotos, dispara la
 * generación y agrega el resultado al carrito.
 *
 * La lógica vive en dos hooks: `usePhotoManager` (fotos + drag & drop) y
 * `usePetUploadForm` (mascotas, formulario y envío). La UI se divide en
 * `PhotoUploadPanel` (izquierda) y `PetDetailsForm` (derecha).
 */
export function IAUploadStep({
  photos,
  onPhotosChange,
  styleId,
  productRefId,
  formatId,
  onNext,
  productInfo,
  styleName,
  userSelections,
}: IAUploadStepProps) {
  const {
    previews,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    removePhoto,
    makePrimary,
  } = usePhotoManager(photos, onPhotosChange);

  const { isAdmin } = useAuth();

  const {
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
  } = usePetUploadForm({
    photos,
    styleId,
    productRefId,
    formatId,
    onNext,
    productInfo,
    styleName,
    userSelections,
  });

  const displayPhoto = previews[0] ?? existingPhotos[0]?.photoUrl ?? null;
  const hasPhoto = photos.length > 0 || existingPhotos.length > 0;
  const hasParams = !!(styleId && productRefId && formatId);

  return (
    <main className="grow flex flex-col px-6 py-8 md:py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {!isAdmin && creditBalance !== null && (
          <div className="mb-4 flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#448da6]/10 px-3 py-1 text-sm font-medium text-[#448da6]">
              <span className="material-symbols-outlined text-base leading-none">
                auto_awesome
              </span>
              {creditBalance} {creditBalance === 1 ? "credit" : "credits"} left
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-stretch flex-1 min-h-0">
          <PhotoUploadPanel
            photos={photos}
            previews={previews}
            isDragging={isDragging}
            displayPhoto={displayPhoto}
            existingPhotos={existingPhotos.map((p) => p.photoUrl)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileInput={handleFileInput}
            onRemovePhoto={removePhoto}
            onMakePrimary={makePrimary}
            onRemoveExistingPhoto={removeExistingPhoto}
            onMakeExistingPrimary={makeExistingPrimary}
          />

          <PetDetailsForm
            formId={PET_FORM_ID}
            pets={pets}
            activePet={activePet}
            isExistingPet={isExistingPet}
            form={form}
            formError={formError}
            outOfCredits={outOfCredits}
            hasPhoto={hasPhoto}
            hasParams={hasParams}
            submitting={submitting}
            onSubmit={handleSubmit}
            onFieldChange={handleFieldChange}
            onSelectPet={selectPet}
            onResetPet={resetPet}
          />
        </div>
      </div>
    </main>
  );
}
