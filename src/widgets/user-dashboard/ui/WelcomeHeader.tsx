"use client";

import type { AccountUser } from "@/entities/order/types";

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
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {initials(user?.fullName, user?.email)}
        </span>
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
    </div>
  );
}
