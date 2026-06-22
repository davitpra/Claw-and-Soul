"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Passwords must match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Minimum password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });

      // Redirect to dashboard or home
      router.push("/");
    } catch (err) {
      console.error("Sign up error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create your account. Please try again.";
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
      router.push("/");
    } catch (err) {
      console.error("Google sign up error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign up with Google.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Failed to sign up with Google. Please try again.");
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
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBnLbQiMdExM2MPf5-ytmXYmp3L_VRTpWfVfcrwMX2LVUpfH_nVYZZztbz1udhWTqZV0WBWE9M1uwdfVmXfVxXPso8ll7j7nsOWnBHLgMXvsVdU__MS5jjA9XAuw6bvQOrgEDf4oHbKvm2c9j7ahU_8FB_4pBNDdSlOyrKxkCfVJAB2Xyl8x0BNAPMH3sDIydmdAt1eWykNv0-g7FVFcigNkfIhc0kxXOBfJe3ulIp5PO4YMnKU02ioE0AerlRcdV3js9BwYR-j-gae")`,
          }}
          role="img"
          aria-label="Happy golden retriever dog smiling with owner outdoors"
        />
        {/* Brand tint + gradient for legibility */}
        <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-dark/80 via-slate-dark/20 to-transparent" />

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-10 top-10 z-10 flex items-center gap-2 text-white"
        >
          <span className="font-display text-xl font-black tracking-tight">
            Claw &amp; Soul
          </span>
        </Link>

        {/* Welcome message */}
        <div className="absolute inset-x-10 bottom-12 z-10 text-white">
          <h2 className="max-w-md font-display text-4xl font-black leading-tight drop-shadow-md">
            Gifts that speak to their soul
          </h2>
          <p className="mt-3 max-w-md text-lg text-white/90 drop-shadow-sm">
            Join thousands of pet parents creating personalized memories that
            last a lifetime.
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
            <span className="font-display text-xl font-black tracking-tight">
              Claw &amp; Soul
            </span>
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-text-main sm:text-4xl">
              Create your account
            </h1>
            <p className="text-base text-text-muted">
              Start your journey to the perfect personalized gift for your furry
              friend.
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

          {/* Google sign up */}
          <div className="flex w-full justify-center scheme:light">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="pill"
              text="signup_with"
              logo_alignment="left"
              width="400"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E0DED9]" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              or sign up with
            </span>
            <div className="h-px flex-1 bg-[#E0DED9]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-text-main"
              >
                Full Name
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-text-muted transition-colors group-focus-within:text-primary">
                  person
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-[#E0DED9] bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

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
              <label
                htmlFor="password"
                className="text-sm font-semibold text-text-main"
              >
                Password
              </label>
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
                  placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-text-main"
              >
                Confirm Password
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-text-muted transition-colors group-focus-within:text-primary">
                  shield
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-[#E0DED9] bg-white pl-12 pr-12 text-base text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Create account button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary transition-colors hover:text-primary-dark"
            >
              Log In
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-xs leading-relaxed text-text-muted">
            By clicking &quot;Create Account&quot;, you agree to Claw &amp;
            Soul&apos;s{" "}
            <Link
              href="/terms"
              className="text-primary underline transition-colors hover:text-primary-dark"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary underline transition-colors hover:text-primary-dark"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
