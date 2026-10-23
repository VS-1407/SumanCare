
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  HeartPulse,
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

type ApiError = {
  detail?: string | { msg?: string; message?: string }[];
  message?: string;
};

function getErrorMessage(data: ApiError | null, status: number): string {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg || item.message || "Invalid input")
      .join(". ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (status === 409) {
    return "An account with these details may already exist.";
  }

  if (status === 422) {
    return "Please check the information you entered.";
  }

  if (status >= 500) {
    return "The server encountered an error. Please try again later.";
  }

  return `Unable to create your account (HTTP ${status}).`;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!API_BASE_URL) {
      setError("The API URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const responseText = await response.text();
      let data: ApiError | null = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText) as ApiError;
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        console.error("Signup API error:", {
          status: response.status,
          response: data ?? responseText,
        });

        throw new Error(getErrorMessage(data, response.status));
      }

      window.location.assign("/login?registered=true");
    } catch (err) {
      console.error("Signup request failed:", err);

      if (err instanceof TypeError) {
        setError(
          "The request could not reach the API. Check your internet connection, API URL, and browser Network tab."
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
              Take a step towards better health.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-gray-600">
              Create your account to keep your health information, daily
              progress, and care journey organized in one place.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Your health. Your insights. Your SumanCare.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 md:py-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex items-center gap-2 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <HeartPulse size={22} />
              </div>
              <span className="text-xl font-bold text-gray-800">
                SumanCare<span className="text-emerald-600">.</span>
              </span>
            </Link>

            <div className="mb-7">
              <p className="mb-2 text-sm font-semibold text-emerald-600">
                GET STARTED
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter your details to get started with SumanCare.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <UserRound size={19} className="text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Mail size={19} className="text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Phone size={19} className="text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Lock size={19} className="text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <Lock size={19} className="text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Login
              </Link>
            </p>

            <p className="mt-6 text-center text-xs leading-5 text-gray-400">
              Your health information is handled by the SumanCare backend.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
