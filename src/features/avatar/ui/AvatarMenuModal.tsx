"use client";

import { cloudinaryThumb } from "@/shared/lib/cloudinary";

// Modal que muestra la foto de perfil actual con las acciones para cambiarla o
// quitarla. Reutiliza el patrón visual del modal `pendingDelete` de
// PetDetail.tsx (overlay + card centrada).
export function AvatarMenuModal({
  avatarUrl,
  uploading,
  removing,
  error,
  onClose,
  onChangePhoto,
  onRemove,
}: {
  avatarUrl: string | null;
  uploading: boolean;
  removing: boolean;
  error: string;
  onClose: () => void;
  onChangePhoto: () => void;
  onRemove: () => void;
}) {
  const busy = uploading || removing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-menu-title"
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="avatar-menu-title"
          className="text-center text-base font-semibold text-text-main"
        >
          Profile photo
        </h2>

        <div className="mt-6 flex justify-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryThumb(avatarUrl, 320)}
              alt="Profile photo"
              className="size-36 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <span className="flex size-36 items-center justify-center rounded-full bg-cream/60 ring-1 ring-black/10">
              <span className="material-symbols-outlined text-[56px] text-text-muted">
                person
              </span>
            </span>
          )}
        </div>

        {error && (
          <p className="mt-4 text-center text-xs text-red-600">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onChangePhoto}
            disabled={busy}
            className="h-11 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="h-11 rounded-full text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove photo"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 rounded-full text-sm font-medium text-text-muted transition-colors hover:text-text-main disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
