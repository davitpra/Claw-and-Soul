"use client";

import { useState } from "react";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";

export interface GridPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
  /** Nombre de la mascota; se usa como alt y como título del preview. */
  alt: string;
}

/**
 * Galería cuadrada de fotos de mascotas. La foto principal se distingue con el
 * borde de marca. Al hacer click abre el preview a tamaño completo, igual que
 * las imágenes del detalle de pedido.
 */
export function PhotoGrid({ photos }: { photos: GridPhoto[] }) {
  const [preview, setPreview] = useState<GridPhoto | null>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
          gap: 8,
        }}
      >
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setPreview(photo)}
            style={{
              aspectRatio: "1",
              padding: 0,
              cursor: "pointer",
              borderRadius: 8,
              overflow: "hidden",
              background: "none",
              border: `2px solid ${
                photo.isPrimary
                  ? "var(--p-color-border-brand)"
                  : "var(--p-color-border)"
              }`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photoUrl}
              alt={photo.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {preview && (
        <ImagePreviewModal
          src={preview.photoUrl}
          title={preview.alt}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
