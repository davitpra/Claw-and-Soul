"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  /** Título de la pregunta (p.ej. "Delete this artwork?"). */
  title: ReactNode;
  /** Texto de apoyo bajo el título. */
  description?: ReactNode;
  /** Contenido extra sobre el título (p.ej. una vista previa de la imagen). */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Etiqueta mientras la acción corre; también deshabilita los botones. */
  loadingLabel?: string;
  /** Icono Material Symbols del botón de confirmar. */
  confirmIcon?: string;
  /** Botón de confirmar en rojo (acción destructiva). Default: true. */
  destructive?: boolean;
  /** Muestra un spinner/estado de carga y bloquea cerrar. */
  loading?: boolean;
  /** Mensaje de error a mostrar dentro del diálogo. */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable de la storefront. Se renderiza en un
 * portal a <body> para escapar contextos de apilamiento/overflow. Cerrar con
 * Escape o clic en el fondo queda bloqueado mientras `loading`.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loadingLabel,
  confirmIcon = "delete",
  destructive = true,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const confirmClasses = destructive
    ? "bg-red-600 text-white hover:bg-red-700"
    : "bg-primary text-white hover:bg-primary-dark";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}

        <h2 className="mt-5 font-display text-lg font-black text-text-main first:mt-0">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[#E0DED9] bg-white px-4 py-2 text-sm font-bold text-text-main transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:opacity-60 ${confirmClasses}`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {confirmIcon}
            </span>
            {loading ? (loadingLabel ?? "Working…") : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
