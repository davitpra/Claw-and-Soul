"use client";

import { useAuth } from "@/context/AuthContext";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import PbnPostMenu, { PbnPostMenuItem } from "./PbnPostMenu";

/** Two-letter initials from a name or email, mirroring the dashboard header. */
function initials(name?: string | null, email?: string) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Instagram-style header overlaid on the top of the result image: avatar + name
 * + timestamp on the left, a three-dots ("⋯") menu on the right. Meant to be
 * rendered as a sibling of the ImageCompareSlider inside its relative container.
 */
export default function PbnPostHeader({
  menuItems,
}: {
  menuItems: PbnPostMenuItem[];
}) {
  const { user, isAuthenticated } = useAuth();

  const name = isAuthenticated
    ? (user?.fullName ?? user?.email ?? "You")
    : "clawandsoul";
  const avatarUrl = isAuthenticated ? user?.avatarUrl : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 rounded-t-xl bg-linear-to-b from-black/55 to-transparent px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 ring-2 ring-white/70">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryThumb(avatarUrl, 72)}
              alt={name}
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : isAuthenticated ? (
            <span className="text-xs font-bold text-primary">
              {initials(user?.fullName, user?.email)}
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/Logo.svg"
              alt="Claw & Soul"
              className="size-6 object-contain"
            />
          )}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-black text-white drop-shadow">
            {name}
          </p>
          <p className="font-body text-xs text-white/80 drop-shadow">now</p>
        </div>
      </div>

      <div className="pointer-events-auto">
        <PbnPostMenu items={menuItems} />
      </div>
    </div>
  );
}
