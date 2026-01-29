"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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

    // Validación básica
    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);

      // Redirigir al dashboard o home
      router.push("/");
    } catch (err) {
      console.error("Error en login:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión. Verifica tus credenciales.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side: Heartwarming Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBnLbQiMdExM2MPf5-ytmXYmp3L_VRTpWfVfcrwMX2LVUpfH_nVYZZztbz1udhWTqZV0WBWE9M1uwdfVmXfVxXPso8ll7j7nsOWnBHLgMXvsVdU__MS5jjA9XAuw6bvQOrgEDf4oHbKvm2c9j7ahU_8FB_4pBNDdSlOyrKxkCfVJAB2Xyl8x0BNAPMH3sDIydmdAt1eWykNv0-g7FVFcigNkfIhc0kxXOBfJe3ulIp5PO4YMnKU02ioE0AerlRcdV3js9BwYR-j-gae")`,
          }}
          role="img"
          aria-label="Happy golden retriever dog smiling with owner outdoors"
        />
        <div className="absolute inset-0 bg-[#448da6]/20 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-md">
            Welcome back to Claw & Soul
          </h2>
          <p className="text-lg opacity-90 drop-shadow-sm max-w-md">
            Continue creating personalized memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-[480px] w-full flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#448da6] text-3xl">
                pets
              </span>
              <span className="text-xl font-bold tracking-tight font-display">
                Claw and Soul
              </span>
            </Link>
            <h1 className="text-[#103642] dark:text-[#f0eee9] text-3xl font-black leading-tight tracking-tight sm:text-4xl font-display">
              Welcome back
            </h1>
            <p className="text-[#103642]/70 dark:text-[#f0eee9]/70 text-base">
              Log in to your account to continue.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="material-symbols-outlined text-red-600 text-xl">
                error
              </span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[#103642] dark:text-[#f0eee9]"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7a7f] text-xl">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex w-full rounded-lg text-[#103642] focus:ring-2 focus:ring-[#448da6]/20 border border-[#dee2e3] bg-white focus:border-[#448da6] h-12 pl-12 pr-4 placeholder:text-[#6c7a7f] text-base font-normal outline-none transition-colors"
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
                  className="text-sm font-semibold text-[#103642] dark:text-[#f0eee9]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#448da6] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7a7f] text-xl">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="flex w-full rounded-lg text-[#103642] focus:ring-2 focus:ring-[#448da6]/20 border border-[#dee2e3] bg-white focus:border-[#448da6] h-12 pl-12 pr-12 placeholder:text-[#6c7a7f] text-base font-normal outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c7a7f] hover:text-[#448da6] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-[#dee2e3] text-[#448da6] focus:ring-[#448da6]/20 focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#103642] dark:text-[#f0eee9]"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-[#448da6] hover:bg-[#3b7d93] text-white text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando sesión..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-[#dee2e3] dark:bg-white/10" />
            <span className="text-sm text-[#6c7a7f] font-medium">OR</span>
            <div className="h-[1px] flex-1 bg-[#dee2e3] dark:bg-white/10" />
          </div>

          {/* Social Login */}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg h-12 px-5 border border-[#dee2e3] bg-white hover:bg-gray-50 text-[#103642] text-base font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-[#103642]/70 dark:text-[#f0eee9]/70">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#448da6] font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
