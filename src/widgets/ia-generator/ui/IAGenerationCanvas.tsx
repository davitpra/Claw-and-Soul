"use client";

import { useState, useEffect } from "react";
import { GenerationStatus } from "@/hooks/useGenerationStatus";

interface IAGenerationCanvasProps {
  status: GenerationStatus;
  isCreating: boolean;
  imageUrl: string | null;
  petPhotoUrl: string | null;
  progress: number | null;
  error: string | null;
  onRetry: () => void;
}

const PROCESSING_MESSAGES = [
  "Analizando la foto...",
  "Pintando con IA...",
  "Refinando detalles...",
  "Añadiendo el toque final...",
];

export function IAGenerationCanvas({
  status,
  isCreating,
  imageUrl,
  petPhotoUrl,
  progress,
  error,
  onRetry,
}: IAGenerationCanvasProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (status !== "processing") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % PROCESSING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [status]);

  if (status === "completed" && imageUrl) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] max-h-[550px] rounded-xl overflow-hidden shadow-xl select-none border-4 border-white bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Foto original de tu mascota"
          className="absolute inset-0 w-full h-full object-cover"
          src={petPhotoUrl ?? imageUrl}
        />
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg z-10">
          Original
        </div>
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-4 border-primary bg-white/10 z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Tu arte generado"
            className="absolute inset-0 w-[200%] max-w-none h-full object-cover object-left"
            src={imageUrl}
          />
          <div className="absolute top-6 right-6 bg-primary/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
            Masterpiece
          </div>
        </div>
        <div className="absolute inset-y-0 left-1/2 -ml-[22px] flex items-center justify-center pointer-events-none z-20">
          <div className="size-11 bg-primary rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center text-white border-4 border-white">
            <span className="material-symbols-outlined">code</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[2.35/1] max-h-[550px] rounded-xl overflow-hidden shadow-xl border-4 border-red-100 bg-red-50 flex flex-col items-center justify-center gap-4 p-8">
        <span className="material-symbols-outlined text-5xl text-red-400">
          error
        </span>
        <p className="text-red-700 font-semibold text-center max-w-md">
          {error ?? "La generación falló. Por favor intenta de nuevo."}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Reintentar
        </button>
      </div>
    );
  }

  if (isCreating || status === "pending" || status === "processing") {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] max-h-[550px] rounded-xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
        {petPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm scale-105"
            src={petPhotoUrl}
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
          <div className="size-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-700 font-semibold text-lg text-center">
            {isCreating
              ? "Iniciando generación..."
              : PROCESSING_MESSAGES[msgIndex]}
          </p>
          {progress != null && (
            <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
          <p className="text-slate-400 text-sm">
            Esto puede tomar 30–90 segundos
          </p>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] max-h-[550px] rounded-xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 flex flex-col items-center justify-center gap-5 p-8">
      {petPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-105"
          src={petPhotoUrl}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="size-16 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-3xl text-primary">
            auto_awesome
          </span>
        </div>
        <p className="text-slate-600 font-medium text-base max-w-sm">
          Tu arte aparecerá aquí. Selecciona un tamaño y pulsa{" "}
          <strong>Generar arte</strong>.
        </p>
      </div>
    </div>
  );
}
