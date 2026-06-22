"use client";

import { useRef, useState } from "react";

const AVATAR_OUTPUT_SIZE = 512;

// Modal para encuadrar (recortar) la foto de perfil antes de subirla. Reutiliza
// el patrón visual del modal `pendingDelete` de PetDetail.tsx (overlay + card),
// añadiendo zoom y arrastre dentro de un marco circular.
export function AvatarFramerModal({
  url,
  uploading,
  error,
  onCancel,
  onConfirm,
}: {
  url: string;
  uploading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    px: number;
    py: number;
    ox: number;
    oy: number;
  } | null>(null);

  const [viewport, setViewport] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const baseScale =
    natural && viewport ? viewport / Math.min(natural.w, natural.h) : 1;
  const scale = baseScale * zoom;
  const dw = natural ? natural.w * scale : 0;
  const dh = natural ? natural.h * scale : 0;

  // Mantiene la imagen siempre cubriendo el marco.
  const clampAt = (s: number, x: number, y: number) => {
    if (!natural) return { x, y };
    const minX = viewport - natural.w * s;
    const minY = viewport - natural.h * s;
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  };

  // Al cargar la imagen: medimos el marco, guardamos su tamaño natural y la
  // centramos (todo en el handler para no llamar setState dentro de un efecto).
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nat = { w: img.naturalWidth, h: img.naturalHeight };
    const vp = viewportRef.current?.clientWidth ?? 0;
    const s = vp / Math.min(nat.w, nat.h);
    setNatural(nat);
    setViewport(vp);
    setOffset({
      x: (vp - nat.w * s) / 2,
      y: (vp - nat.h * s) / 2,
    });
  };

  const handleZoom = (next: number) => {
    if (!natural || !viewport) {
      setZoom(next);
      return;
    }
    const oldS = baseScale * zoom;
    const newS = baseScale * next;
    const c = viewport / 2;
    const ix = (c - offset.x) / oldS;
    const iy = (c - offset.y) / oldS;
    setZoom(next);
    setOffset(clampAt(newS, c - ix * newS, c - iy * newS));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!natural) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      px: e.clientX,
      py: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset(
      clampAt(scale, d.ox + (e.clientX - d.px), d.oy + (e.clientY - d.py)),
    );
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !natural || !viewport) return;
    const sSize = viewport / scale;
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_OUTPUT_SIZE;
    canvas.height = AVATAR_OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      img,
      -offset.x / scale,
      -offset.y / scale,
      sSize,
      sSize,
      0,
      0,
      AVATAR_OUTPUT_SIZE,
      AVATAR_OUTPUT_SIZE,
    );
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frame-avatar-title"
      onClick={() => !uploading && onCancel()}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="frame-avatar-title"
          className="text-center text-base font-semibold text-text-main"
        >
          Frame your photo
        </h2>
        <p className="mt-1 text-center text-xs text-text-muted">
          Drag to reposition · slide to zoom
        </p>

        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative mx-auto mt-6 aspect-square w-full max-w-60 cursor-grab touch-none select-none overflow-hidden rounded-full bg-cream/60 active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={url}
            alt="Selected"
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              position: "absolute",
              left: offset.x,
              top: offset.y,
              width: dw || undefined,
              height: dh || undefined,
            }}
            className="max-w-none"
          />
          {/* aro sutil que delimita el encuadre */}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoom(Number(e.target.value))}
          className="mt-6 h-1 w-full cursor-pointer accent-primary"
          aria-label="Zoom"
        />

        {error && (
          <p className="mt-4 text-center text-xs text-red-600">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={uploading || !natural}
            className="h-11 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {uploading ? "Saving…" : "Save photo"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="h-11 rounded-full text-sm font-medium text-text-muted transition-colors hover:text-text-main disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
