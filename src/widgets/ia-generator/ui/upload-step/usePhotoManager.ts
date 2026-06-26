"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MAX_PHOTOS } from "./types";

/**
 * Encapsula el manejo de las fotos subidas por el usuario: previsualizaciones
 * (object URLs), drag & drop, selección por input, y reordenar/quitar fotos.
 */
export function usePhotoManager(
  photos: File[],
  onPhotosChange: (files: File[]) => void,
) {
  const [isDragging, setIsDragging] = useState(false);

  // Previsualizaciones derivadas de los archivos; se revocan al cambiar.
  const previews = useMemo(
    () => photos.map((f) => URL.createObjectURL(f)),
    [photos],
  );
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Ignora los eventos disparados al pasar sobre elementos hijos del dropzone
    // (evita el parpadeo del estado isDragging en algunos navegadores).
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addPhotos(Array.from(e.target.files));
      e.target.value = "";
    },
    [addPhotos],
  );

  const removePhoto = useCallback(
    (index: number) => {
      onPhotosChange(photos.filter((_, i) => i !== index));
    },
    [photos, onPhotosChange],
  );

  // Mueve la foto seleccionada al inicio para que sea la principal.
  const makePrimary = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...photos];
      const [chosen] = next.splice(index, 1);
      onPhotosChange([chosen, ...next]);
    },
    [photos, onPhotosChange],
  );

  return {
    previews,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    removePhoto,
    makePrimary,
  };
}
