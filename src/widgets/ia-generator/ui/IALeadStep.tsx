"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface IALeadStepProps {
  onComplete: () => void;
}

export function IALeadStep({ onComplete }: IALeadStepProps) {
  const { login, register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Auth panel state
  type AuthTab = "register" | "login";
  const [authTab, setAuthTab] = useState<AuthTab>("register");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await register({
        email,
        password: authPassword,
        fullName: fullName || undefined,
      });
      onComplete();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await login(email, authPassword);
      onComplete();
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <main className="grow flex items-center justify-center px-6 py-8 animate-in fade-in duration-500">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E5E0D8] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <h2 className="text-2xl font-black text-slate-dark font-display mb-1">
              {authTab === "register"
                ? "Create Your Account"
                : "Sign In to Continue"}
            </h2>
            <p className="text-slate-dark/60 text-sm">
              {authTab === "register"
                ? "Save your pet\u2019s profile and photos securely."
                : "Welcome back! Sign in to upload your pet\u2019s photo."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E5E0D8] mx-8">
            <button
              onClick={() => {
                setAuthTab("register");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                authTab === "register"
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-dark/50 hover:text-slate-dark"
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                authTab === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-dark/50 hover:text-slate-dark"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Forms */}
          <div className="px-8 py-6 space-y-4">
            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="material-symbols-outlined text-red-600 text-[18px]">
                  error
                </span>
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            {authTab === "register" ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full h-12 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authSubmitting
                    ? "Creating account..."
                    : "Create Account & Continue"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full h-12 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authSubmitting ? "Signing in..." : "Sign In & Continue"}
                </button>
              </form>
            )}

            <p className="text-xs text-center text-slate-dark/40 italic">
              By continuing, you agree to receive art updates from Claw and
              Soul.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
