"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useCredits } from "@/hooks/useCredits";
import { ActiveSessions } from "@/widgets/active-sessions";
import { useAvatarUpload } from "@/features/avatar";
import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import type { ApiEnvelope, UserProfile } from "@/entities/order/types";

function initials(name?: string | null, email?: string) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const inputClass =
  "flex w-full rounded-lg text-text-main focus:ring-2 focus:ring-primary/20 border border-[#dee2e3] bg-white focus:border-primary h-12 pl-12 pr-12 placeholder:text-text-muted text-base font-normal outline-none transition-colors disabled:bg-cream/60 disabled:text-text-muted disabled:cursor-not-allowed";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-black text-text-main">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-main">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function Alert({
  kind,
  message,
}: {
  kind: "error" | "success";
  message: string;
}) {
  const isError = kind === "error";
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      <span className="material-symbols-outlined text-xl">
        {isError ? "error" : "check_circle"}
      </span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function UserProfilePage() {
  const { user, isAdmin } = useAuth();
  const { get, authFetchJSON } = useAuthFetch();
  const { balance: credits } = useCredits();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // --- Avatar ---
  const avatar = useAvatarUpload(profile?.avatarUrl, setProfile);

  // --- Name form ---
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [savingName, setSavingName] = useState(false);

  // --- Password form ---
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    let active = true;
    get<ApiEnvelope<UserProfile>>("/users/me")
      .then((res) => {
        if (active && res.data) {
          setProfile(res.data);
          setFullName(res.data.fullName ?? "");
        }
      })
      .catch(() => {
        /* keep AuthContext fallback */
      });
    return () => {
      active = false;
    };
  }, [get]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");

    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameError("Please enter your name.");
      return;
    }

    setSavingName(true);
    try {
      const res = await authFetchJSON<ApiEnvelope<UserProfile>>("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      if (res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName ?? "");
      }
      setNameSuccess("Name updated successfully.");
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Could not update your name.",
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (passwords.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setSavingPw(true);
    try {
      await authFetchJSON("/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      setPwSuccess("Password updated successfully.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPwError(
        err instanceof Error ? err.message : "Could not update your password.",
      );
    } finally {
      setSavingPw(false);
    }
  };

  const email = profile?.email ?? user?.email ?? "";

  return (
    <Container className="pb-10">
      <div className="flex flex-col gap-6">
        {/* Account details */}
        <SectionCard
          title="Account"
          description="Your account details. Email changes are coming soon."
        >
          <div className="flex flex-col gap-6">
            {/* Identity header */}
            <div className="flex flex-col items-center gap-4 rounded-xl bg-cream/60 p-5 text-center sm:flex-row sm:gap-5 sm:p-6 sm:text-left">
              <button
                type="button"
                onClick={avatar.openMenu}
                className="group relative size-20 shrink-0 overflow-hidden rounded-full"
                aria-label="Open profile photo options"
              >
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryThumb(profile.avatarUrl, 160)}
                    alt={profile.fullName || "Profile photo"}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                    {initials(profile?.fullName ?? user?.fullName, email)}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white">
                    photo_camera
                  </span>
                </span>
              </button>
              <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
                <p className="truncate font-display text-lg font-black text-text-main">
                  {profile?.fullName || user?.fullName || "Your name"}
                </p>
                {email && (
                  <p className="truncate text-sm text-text-muted">{email}</p>
                )}
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-muted">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  Member since {formatDate(profile?.createdAt)}
                </span>
              </div>
            </div>

            {/* Editable fields */}
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              {nameError && <Alert kind="error" message={nameError} />}
              {nameSuccess && <Alert kind="success" message={nameSuccess} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" icon="person">
                  <input
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email" icon="mail">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={inputClass}
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={savingName}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-base font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start sm:px-8"
              >
                {savingName ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </SectionCard>

        {/* Credits */}
        {!isAdmin && (
          <SectionCard
            title="Credits"
            description="Generation credits available on your account."
          >
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-3 rounded-xl bg-primary/10 px-5 py-4">
                <span className="material-symbols-outlined text-3xl leading-none text-primary">
                  auto_awesome
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-2xl font-black text-primary">
                    {credits === null ? "—" : credits}
                  </span>
                  <span className="text-sm text-text-muted">
                    {credits === 1 ? "credit left" : "credits left"}
                  </span>
                </div>
              </div>
              <Link
                href="/credits"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-primary-dark sm:w-auto"
              >
                <span className="material-symbols-outlined text-xl">
                  add_shopping_cart
                </span>
                Buy credits
              </Link>
            </div>
          </SectionCard>
        )}

        {/* Password */}
        <SectionCard
          title="Password"
          description="Choose a strong password you don't use elsewhere."
        >
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            {pwError && <Alert kind="error" message={pwError} />}
            {pwSuccess && <Alert kind="success" message={pwSuccess} />}
            <Field label="Current password" icon="lock">
              <input
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter your current password"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  {showCurrent ? "visibility_off" : "visibility"}
                </span>
              </button>
            </Field>
            <Field label="New password" icon="key">
              <input
                name="newPassword"
                type={showNew ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                placeholder="At least 8 characters"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  {showNew ? "visibility_off" : "visibility"}
                </span>
              </button>
            </Field>
            <Field label="Confirm new password" icon="shield">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Re-enter your new password"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </Field>
            <button
              type="submit"
              disabled={savingPw}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-base font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start sm:px-8"
            >
              {savingPw ? "Updating..." : "Update password"}
            </button>
          </form>
        </SectionCard>

        {/* Active sessions */}
        <section className="rounded-xl bg-white p-6 sm:p-8">
          <ActiveSessions />
        </section>
      </div>

      {avatar.elements}
    </Container>
  );
}
