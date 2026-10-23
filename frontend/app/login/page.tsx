
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed. Please try again.");
      }

      if (!data?.access_token) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      sessionStorage.setItem("sumancare_access_token", data.access_token);
      sessionStorage.setItem("sumancare_patient_id", String(data.patient_id));

      window.location.assign("/");

    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the server. Please check your connection and try again."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-xl shadow-emerald-900/5 md:grid-cols-2">
        {/* LEFT BRAND PANEL */}
        <section className="hidden flex-col justify-between bg-gradient-to-br from-[#e6f7f0] via-[#f0faf6] to-[#e7f2ff] p-12 md:flex">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <HeartPulse size={24} />
            </div>

            <span className="text-2xl font-bold tracking-tight text-gray-800">
              SumanCare<span className="text-emerald-600">.</span>
            </span>
          </Link>

          <div>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-emerald-600 shadow-lg shadow-emerald-900/5">
              <HeartPulse size={42} />
            </div>

            <h1 className="max-w-sm text-4xl font-bold leading-tight text-gray-800">
              Your health journey, all in one place.
            </h1>

            <p className="mt-4 max-w-sm text-base leading-7 text-gray-600">
              Track your health, understand your progress, and stay connected
              with the information that matters to you.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Your health. Your insights. Your SumanCare.
          </p>
        </section>

        {/* LOGIN FORM PANEL */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 md:py-14">
          <div className="w-full max-w-md">
            {/* MOBILE BRAND */}
            <Link href="/" className="mb-10 flex items-center gap-2 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <HeartPulse size={22} />
              </div>

              <span className="text-xl font-bold text-gray-800">
                SumanCare<span className="text-emerald-600">.</span>
              </span>
            </Link>

            {/* HEADING */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-emerald-600">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Login to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter your details to access your personal health dashboard.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Mail size={19} className="shrink-0 text-gray-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setError("Password recovery is not available yet.")
                    }
                    className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Lock size={19} className="shrink-0 text-gray-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-gray-400 transition hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to SumanCare
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* SIGNUP LINK */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Create account
              </Link>
            </p>

            {/* PRIVACY NOTE */}
            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              Your health information should remain private and secure.
              Authentication is available when the backend is connected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}