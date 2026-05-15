"use client";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

export function ActiveSessions() {
  const { get, post } = useAuthFetch();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await get<{ sessions: Session[]; total: number }>(
        "/auth/sessions"
      );
      setSessions(data.sessions);
      setError("");
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

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
      const result = await post<{ message: string; count: number }>(
        "/auth/sessions/revoke-all"
      );
      alert(`Successfully logged out from ${result.count} other device(s)`);
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
        <div className="text-[#6c7a7f]">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#103642] dark:text-[#f0eee9]">
            Active Sessions
          </h2>
          <p className="text-sm text-[#6c7a7f] mt-1">
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
          <div className="p-8 text-center text-[#6c7a7f]">
            No active sessions found
          </div>
        ) : (
          sessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2327] border border-[#dee2e3] dark:border-[#2a3337] rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#448da6] text-3xl">
                  {index === 0 ? "laptop" : "devices"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#103642] dark:text-[#f0eee9]">
                      {index === 0 ? "This device" : `Device ${index + 1}`}
                    </h3>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#6c7a7f] mt-1">
                    <div>Logged in: {formatDate(session.createdAt)}</div>
                    <div>Expires: {formatDate(session.expiresAt)}</div>
                  </div>
                </div>
              </div>

              {index !== 0 && (
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

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <span className="material-symbols-outlined text-blue-600 text-xl">
            info
          </span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Security Tip</p>
            <p>
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
