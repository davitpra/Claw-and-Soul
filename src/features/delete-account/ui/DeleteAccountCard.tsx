"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";

const inputClass =
  "flex w-full rounded-lg text-text-main focus:ring-2 focus:ring-red-500/20 border border-[#dee2e3] bg-white focus:border-red-500 h-12 px-4 placeholder:text-text-muted text-base font-normal outline-none transition-colors disabled:bg-cream/60 disabled:cursor-not-allowed";

interface DeleteAccountCardProps {
  email: string;
  /**
   * Google accounts have no password, so asking for one would lock them out of
   * deleting their account. The backend applies the same rule.
   */
  hasPassword: boolean;
}

/**
 * Danger zone of the profile page: permanent account deletion.
 *
 * Kept behind a two-step flow (open the form, then retype the email) because a
 * single misplaced click should never close an account. Deletion is a soft
 * delete: access is revoked now and personal data is erased 30 days later.
 */
export function DeleteAccountCard({
  email,
  hasPassword,
}: DeleteAccountCardProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { authFetchJSON } = useAuthFetch();

  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const emailMatches =
    confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();
  const canSubmit = emailMatches && (!hasPassword || password.length > 0);

  const reset = () => {
    setOpen(false);
    setConfirmEmail("");
    setPassword("");
    setError("");
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDeleting(true);

    try {
      await authFetchJSON("/users/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmEmail: confirmEmail.trim(),
          ...(hasPassword ? { password } : {}),
        }),
      });

      // The backend already revoked every session and cleared the cookies;
      // logout() is what resets the client-side auth state.
      await logout();
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete your account.",
      );
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-xl border border-red-200 bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-black text-red-600">
        Delete account
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Your access is revoked immediately. Your name, email, profile photo and
        pet photos are permanently erased 30 days later. Past orders are kept for
        accounting.
      </p>

      <div className="mt-6">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-12 cursor-pointer items-center justify-center rounded-lg border border-red-300 px-6 text-base font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                <span className="material-symbols-outlined text-xl">error</span>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-main">
                Type <span className="font-mono">{email}</span> to confirm
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={email}
                autoComplete="off"
                className={inputClass}
                disabled={deleting}
                required
              />
            </div>

            {hasPassword && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-main">
                  Current password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={inputClass}
                  disabled={deleting}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={!canSubmit || deleting}
                className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-red-600 px-6 text-base font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={deleting}
                className="flex h-12 cursor-pointer items-center justify-center rounded-lg px-6 text-base font-bold text-text-main transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
