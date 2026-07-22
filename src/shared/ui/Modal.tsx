"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Title shown in the modal header, next to the close button. */
  title?: ReactNode;
  /** Tailwind max-width class for the panel (e.g. "max-w-lg"). */
  maxWidth?: string;
  /** Accessible label announced for the dialog. */
  label?: string;
  /** Actions pinned below the scrollable body (e.g. a "Done" button). */
  footer?: ReactNode;
}

/**
 * Reusable modal shell for the storefront. Rendered through a portal to <body>
 * so it escapes any ancestor that captures pointer events (e.g. the
 * ImageCompareSlider drag surface) and any overflow/stacking context. The
 * header shows a close button; the caller provides its own title/content.
 */
export default function Modal({
  open,
  onClose,
  children,
  title,
  maxWidth = "max-w-3xl",
  label,
  footer,
}: ModalProps) {
  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center border-b border-[#E0DED9] px-4 py-3 ${
            title ? "justify-between" : "justify-end"
          }`}
        >
          {title && (
            <h4 className="font-display text-lg font-black text-slate-dark">
              {title}
            </h4>
          )}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-slate-dark"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
        {footer && (
          <div className="border-t border-[#E0DED9] px-4 py-3">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
