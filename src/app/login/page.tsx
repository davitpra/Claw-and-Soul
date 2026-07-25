"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);

      // Redirect to the original page or home
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to log in. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setError("");

    if (!credentialResponse.credential) {
      setError("No token received from Google. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      await loginWithGoogle(credentialResponse.credential);

      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    } catch (err) {
      console.error("Google login error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in with Google.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Failed to sign in with Google. Please try again.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background-light">
      {/* Left panel: heartwarming image */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url("/images/login-hero.webp")`,
          }}
          role="img"
          aria-label="Painterly portrait of a dog and cat cuddling together"
        />
        {/* Brand tint + gradient for legibility */}
        <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-dark/80 via-slate-dark/20 to-transparent" />

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-10 top-10 z-10 flex items-center gap-2 text-white"
        >
          <h2 className="font-display text-white text-lg lg:text-2xl font-black leading-tight tracking-[-0.015em] hidden sm:block">
            Claw & Soul
          </h2>
        </Link>

        {/* Welcome message */}
        <div className="absolute inset-x-10 bottom-12 z-10 text-white">
          <h2 className="max-w-md font-display text-4xl font-black leading-tight drop-shadow-md">
            Your pet&apos;s soul, turned into art
          </h2>
          <p className="mt-3 max-w-md text-lg text-white/90 drop-shadow-sm">
            Log in to keep creating personalized memories that last a lifetime.
          </p>

          {/* Floating trust card */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <span className="text-base tracking-tight text-yellow-500">
              ★★★★★
            </span>
            <p className="text-sm font-bold text-slate-dark">
              Loved by thousands of families
            </p>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-8">
        <div className="flex w-full max-w-105 flex-col gap-8">
          {/* Logo on mobile */}
          <Link
            href="/"
            className="flex items-center gap-2 text-text-main lg:hidden"
          >
            <h2 className="font-display text-text-main text-lg lg:text-2xl font-black leading-tight tracking-[-0.015em] hidden sm:block">
              Claw & Soul
            </h2>
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-text-main sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-base text-text-muted">
              Log in to your account to continue.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="material-symbols-outlined text-xl text-red-600">
                error
              </span>
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}
          {/* Google login */}
          <div className="flex w-full justify-center scheme:light">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              logo_alignment="left"
              width="400"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E0DED9]" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              or continue with
            </span>
            <div className="h-px flex-1 bg-[#E0DED9]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-text-main"
              >
                Email Address
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-text-muted transition-colors group-focus-within:text-primary">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-[#E0DED9] bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-text-main"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-text-muted transition-colors group-focus-within:text-primary">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-[#E0DED9] bg-white pl-12 pr-12 text-base text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label
              htmlFor="remember"
              className="flex cursor-pointer items-center gap-2 text-sm text-text-main"
            >
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-[#E0DED9] accent-primary"
              />
              Remember me for 30 days
            </label>

            {/* Log in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary transition-colors hover:text-primary-dark"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-light" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
