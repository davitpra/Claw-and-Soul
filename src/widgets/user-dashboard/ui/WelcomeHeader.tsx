"use client";

import { useState } from "react";
import type { AccountUser } from "@/entities/order/types";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { useAvatarUpload } from "@/features/avatar";

function initials(name?: string | null, email?: string) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const roleLabels: Record<string, string> = {
  user: "Member",
  premium: "Premium Member",
  admin: "Admin",
};

export function WelcomeHeader({
  user,
  title,
  subtitle,
}: {
  user: AccountUser | null;
  title: string;
  subtitle: string;
}) {
  const role = user?.role ?? "user";

  // Permite cambiar la foto haciendo clic en el avatar; mostramos el resultado
  // al instante con un override local (undefined = sin override; null = quitada).
  const [avatarOverride, setAvatarOverride] = useState<
    string | null | undefined
  >(undefined);
  const avatarUrl =
    avatarOverride !== undefined ? avatarOverride : (user?.avatarUrl ?? null);
  const avatar = useAvatarUpload(avatarUrl, (profile) =>
    setAvatarOverride(profile.avatarUrl),
  );

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Account
        </p>
        <h1 className="font-display font-black mt-1 text-3xl text-text-main sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-white p-4">
        <button
          type="button"
          onClick={avatar.openMenu}
          className="group relative size-25 shrink-0 overflow-hidden rounded-full"
          aria-label="Open profile photo options"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryThumb(avatarUrl, 160)}
              alt={user?.fullName || "Profile photo"}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
              {initials(user?.fullName, user?.email)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="material-symbols-outlined text-[20px] text-white">
              photo_camera
            </span>
          </span>
        </button>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-text-main">
            {user?.fullName || "Your account"}
          </p>
          <p className="truncate text-sm text-text-muted">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            {roleLabels[role] ?? role}
          </span>
        </div>
      </div>

      {avatar.elements}
    </div>
  );
}
