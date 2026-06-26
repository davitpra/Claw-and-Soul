"use client";

import { MAX_PHOTOS } from "./types";

interface PhotoUploadPanelProps {
  photos: File[];
  previews: string[];
  isDragging: boolean;
  displayPhoto: string | null;
  existingPhotoUrl: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onMakePrimary: (index: number) => void;
  onClearExistingPhoto: () => void;
}

type Thumb =
  | { kind: "upload"; src: string; index: number }
  | { kind: "existing"; src: string };

/**
 * Columna izquierda del paso de subida: zona de drop con previsualización
 * principal y tira de miniaturas para reordenar/quitar fotos.
 */
export function PhotoUploadPanel({
  photos,
  previews,
  isDragging,
  displayPhoto,
  existingPhotoUrl,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
  onRemovePhoto,
  onMakePrimary,
  onClearExistingPhoto,
}: PhotoUploadPanelProps) {
  const atMax = photos.length >= MAX_PHOTOS;

  // Galería unificada: las fotos subidas mandan; si no hay ninguna pero existe
  // la foto guardada de la mascota, se muestra esa como miniatura principal.
  const thumbs: Thumb[] =
    previews.length > 0
      ? previews.map((src, index) => ({ kind: "upload", src, index }))
      : existingPhotoUrl
        ? [{ kind: "existing", src: existingPhotoUrl }]
        : [];

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-display text-xl font-black text-slate-dark mb-4">
        Upload Pet Photos
      </h2>

      {/* Main preview / drop zone */}
      <div
        className={`group relative rounded-xl overflow-hidden transition-all duration-300 flex-1 min-h-[50vh] md:min-h-50 ${
          atMax ? "cursor-default" : "cursor-pointer"
        } ${
          displayPhoto
            ? "bg-slate-100"
            : `border-2 border-dashed flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5"
              }`
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          aria-label="Subir fotos de tu mascota"
          disabled={atMax}
          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${
            atMax ? "pointer-events-none" : "cursor-pointer"
          }`}
          onChange={onFileInput}
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
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-end pb-5 gap-1 pointer-events-none">
              <span className="material-symbols-outlined text-white text-3xl">
                photo_camera
              </span>
              <p className="text-white text-sm font-semibold tracking-wide">
                {atMax
                  ? "Remove a photo to add another"
                  : "Click to add more photos"}
              </p>
            </div>

            {/* Primary badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-2.5 py-1.5 rounded-full pointer-events-none">
              Principal
            </div>

            {/* Remove button */}
            <button
              type="button"
              title="Quitar foto"
              aria-label="Quitar foto principal"
              onClick={(e) => {
                e.stopPropagation();
                if (photos.length > 0) onRemovePhoto(0);
                else onClearExistingPhoto();
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
              JPG, PNG, WEBP · Max 10 MB · up to {MAX_PHOTOS} photos
            </p>
          </>
        )}
      </div>

      {/* Thumbnail strip: siempre MAX_PHOTOS celdas (llenas, tile de añadir y placeholders) */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {Array.from({ length: MAX_PHOTOS }).map((_, slot) => {
          const thumb = thumbs[slot];

          // Primer hueco libre: tile para añadir más fotos (el drop zone grande
          // ya cubre la subida cuando aún no hay ninguna foto).
          if (!thumb) {
            if (thumbs.length > 0 && slot === thumbs.length && !atMax) {
              return (
                <label
                  key="add"
                  className="relative aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Añadir más fotos"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onFileInput}
                  />
                  <span className="material-symbols-outlined text-2xl">
                    add_a_photo
                  </span>
                </label>
              );
            }

            // Resto de huecos: placeholder pasivo.
            return (
              <div
                key={`placeholder-${slot}`}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300"
              >
                <span className="material-symbols-outlined text-2xl">
                  image
                </span>
              </div>
            );
          }

          const isPrimary = thumb.kind === "existing" || thumb.index === 0;
          return (
            <div
              key={thumb.kind === "existing" ? "existing" : thumb.src}
              className={`group/thumb relative aspect-square rounded-lg overflow-hidden border-2 ${
                isPrimary ? "border-primary" : "border-slate-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb.src}
                alt={
                  thumb.kind === "existing"
                    ? "Saved pet photo"
                    : `Pet photo ${thumb.index + 1}`
                }
                className="absolute inset-0 w-full h-full object-cover"
              />

              {isPrimary ? (
                <span className="absolute bottom-0 inset-x-0 bg-primary text-white text-[10px] font-semibold text-center py-0.5 pointer-events-none">
                  Principal
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onMakePrimary(thumb.index)}
                  title="Hacer principal"
                  aria-label="Hacer foto principal"
                  className="absolute bottom-1 left-1 z-10 size-4 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 hover:bg-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[10px]">
                    star
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  thumb.kind === "existing"
                    ? onClearExistingPhoto()
                    : onRemovePhoto(thumb.index)
                }
                title="Quitar foto"
                aria-label="Quitar foto"
                className="absolute top-1 right-1 z-10 size-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 hover:bg-red-500 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400 text-center flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-[14px] text-amber-400">
          lightbulb
        </span>
        Upload 1 to {MAX_PHOTOS} photos · the first one will be your main photo
      </p>
    </div>
  );
}
