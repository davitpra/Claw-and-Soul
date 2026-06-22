"use client";

import { useRef, useState } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type { ApiEnvelope, UserProfile } from "@/entities/order/types";
import { AvatarFramerModal } from "./ui/AvatarFramerModal";
import { AvatarMenuModal } from "./ui/AvatarMenuModal";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Encapsula el flujo de cambio de foto de perfil. Al hacer `openMenu()` se abre
 * un modal con la foto actual y las acciones "Change photo" (→ selección de
 * archivo → encuadre → subida) y "Remove photo" (→ borrado).
 *
 * Renderiza `elements` (input oculto + modales) en cualquier parte del árbol y
 * dispara `openMenu()` desde el control que prefieras (p. ej. el avatar).
 * `onChange` recibe el `UserProfile` actualizado tras subir o quitar la foto.
 */
export function useAvatarUpload(
  currentAvatarUrl: string | null | undefined,
  onChange: (profile: UserProfile) => void,
) {
  const { authFetchJSON } = useAuthFetch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const openMenu = () => {
    setError("");
    setMenuOpen(true);
  };
  const closeMenu = () => {
    setError("");
    setMenuOpen(false);
  };

  const openPicker = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permite volver a elegir el mismo archivo más adelante.
    e.target.value = "";
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    // Pasamos del menú al encuadre.
    setMenuOpen(false);
    setPendingUrl(URL.createObjectURL(file));
  };

  const closeFramer = () => {
    setError("");
    setPendingUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  };

  const handleConfirm = async (blob: Blob) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", blob, "avatar.jpg");
      const res = await authFetchJSON<ApiEnvelope<UserProfile>>(
        "/users/me/avatar",
        { method: "POST", body: formData },
      );
      if (res.data) onChange(res.data);
      closeFramer();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not upload your photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setError("");
    setRemoving(true);
    try {
      const res = await authFetchJSON<ApiEnvelope<UserProfile>>(
        "/users/me/avatar",
        { method: "DELETE" },
      );
      if (res.data) onChange(res.data);
      setMenuOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove your photo.",
      );
    } finally {
      setRemoving(false);
    }
  };

  const elements = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {menuOpen && (
        <AvatarMenuModal
          avatarUrl={currentAvatarUrl ?? null}
          uploading={uploading}
          removing={removing}
          error={error}
          onClose={closeMenu}
          onChangePhoto={openPicker}
          onRemove={handleRemove}
        />
      )}
      {pendingUrl && (
        <AvatarFramerModal
          url={pendingUrl}
          uploading={uploading}
          error={error}
          onCancel={closeFramer}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );

  return { openMenu, elements, uploading, removing, error };
}
