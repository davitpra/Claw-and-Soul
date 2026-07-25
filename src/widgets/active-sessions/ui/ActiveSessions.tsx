"use client";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useCallback, useEffect, useState } from "react";
import type { ApiEnvelope } from "@/entities/order/types";
import { parseUserAgent } from "../lib/parse-user-agent";

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isCurrent?: boolean;
}

export function ActiveSessions() {
  const { get, post } = useAuthFetch();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get<ApiEnvelope<{ sessions: Session[]; total: number }>>(
        "/auth/sessions"
      );
      setSessions(res.data?.sessions ?? []);
      setError("");
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revokeSession = async (sessionId: string) => {
    try {
      await post(`/auth/sessions/revoke/${sessionId}`);
      // Reload sessions
      await loadSessions();
    } catch (err) {
      console.error("Error revoking session:", err);
      setError("Failed to revoke session");
    }
  };

  const revokeAllOtherSessions = async () => {
    if (
      !confirm(
        "Are you sure you want to log out from all other devices? You'll remain logged in on this device."
      )
    ) {
      return;
    }

    try {
      const res = await post<ApiEnvelope<{ message: string; count: number }>>(
        "/auth/sessions/revoke-all"
      );
      alert(
        `Successfully logged out from ${res.data?.count ?? 0} other device(s)`
      );
      await loadSessions();
    } catch (err) {
      console.error("Error revoking sessions:", err);
      setError("Failed to revoke sessions");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-text-main">
            Active Sessions
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Manage your active login sessions across all devices
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={revokeAllOtherSessions}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Log out all other devices
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No active sessions found
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-cream/40 border border-[#dee2e3] rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {session.isCurrent ? "laptop" : "devices"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-text-main">
                      {parseUserAgent(session.userAgent)}
                    </h3>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-muted mt-1">
                    {session.ipAddress && <div>IP: {session.ipAddress}</div>}
                    <div>Logged in: {formatDate(session.createdAt)}</div>
                    {session.lastUsedAt && (
                      <div>Last active: {formatDate(session.lastUsedAt)}</div>
                    )}
                    <div>Expires: {formatDate(session.expiresAt)}</div>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex gap-2">
          <span className="material-symbols-outlined text-primary text-xl">
            info
          </span>
          <div className="text-sm text-text-main">
            <p className="font-semibold mb-1">Security Tip</p>
            <p className="text-text-muted">
              Sessions are automatically rotated for security. If you see
              unfamiliar devices, revoke them immediately and change your
              password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
