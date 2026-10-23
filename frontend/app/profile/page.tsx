
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  CalendarDays,
  ChevronRight,
  Droplets,
  HeartPulse,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Profile = {
  id?: number | string;
  patient_id?: number | string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  dob?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  height_cm?: number | string | null;
  weight_kg?: number | string | null;
  allergies?: string | null;
  water_goal_liters?: number | string | null;
  water_goal?: number | string | null;
};

type ProfileForm = {
  date_of_birth: string;
  gender: string;
  blood_group: string;
  height_cm: string;
  weight_kg: string;
  allergies: string;
};

const emptyForm: ProfileForm = {
  date_of_birth: "",
  gender: "",
  blood_group: "",
  height_cm: "",
  weight_kg: "",
  allergies: "",
};

function textValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

function dateInputValue(value: unknown): string {
  if (!value) return "";

  const valueString = String(value);

  // Preserve the date portion returned by an API.
  if (/^\d{4}-\d{2}-\d{2}/.test(valueString)) {
    return valueString.slice(0, 10);
  }

  return "";
}

function formatDate(value: string | null): string {
  if (!value) return "Not provided";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getAge(value: string | null): string {
  if (!value) return "Not provided";

  const parts = value.slice(0, 10).split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return "Not provided";
  }

  const [year, month, day] = parts;
  const now = new Date();

  let age = now.getFullYear() - year;

  if (
    now.getMonth() + 1 < month ||
    (now.getMonth() + 1 === month && now.getDate() < day)
  ) {
    age--;
  }

  if (age < 0 || age > 125) return "Not provided";

  return `${age} years`;
}

function getApiError(result: unknown, fallback: string): string {
  if (result && typeof result === "object" && "detail" in result) {
    const detail = (result as { detail?: unknown }).detail;

    if (typeof detail === "string") return detail;
  }

  return fallback;
}

function toProfileForm(data: Profile): ProfileForm {
  return {
    date_of_birth: dateInputValue(
      data.date_of_birth ?? data.dob ?? data.birth_date
    ),
    gender: data.gender ?? "",
    blood_group: data.blood_group ?? "",
    height_cm: data.height_cm == null ? "" : String(data.height_cm),
    weight_kg: data.weight_kg == null ? "" : String(data.weight_kg),
    allergies: data.allergies ?? "",
  };
}

export default function ProfilePage() {
  const router = useRouter();

  const [account, setAccount] = useState<Profile | null>(null);
  const [healthProfile, setHealthProfile] = useState<Profile | null>(null);
  const [healthProfileExists, setHealthProfileExists] = useState(false);

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = sessionStorage.getItem("sumancare_access_token");

    if (!token) {
      setAccount(null);
      setHealthProfile(null);
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const accountResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (
        accountResponse.status === 401 ||
        accountResponse.status === 403
      ) {
        sessionStorage.removeItem("sumancare_access_token");
        setAccount(null);
        setHealthProfile(null);
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!accountResponse.ok) {
        throw new Error("Unable to load your account details.");
      }

      const accountResult: unknown = await accountResponse.json();

      if (!accountResult || typeof accountResult !== "object") {
        throw new Error("The account response is invalid.");
      }

      const accountData = accountResult as Record<string, unknown>;
      const nestedAccount =
        accountData.user ?? accountData.patient ?? accountData.profile;

      const user =
        nestedAccount && typeof nestedAccount === "object"
          ? (nestedAccount as Profile)
          : (accountData as Profile);

      setAccount(user);

      const healthResponse = await fetch(`${API_BASE_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (healthResponse.status === 401 || healthResponse.status === 403) {
        sessionStorage.removeItem("sumancare_access_token");
        setAccount(null);
        setHealthProfile(null);
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (healthResponse.status === 404) {
        setHealthProfile(null);
        setHealthProfileExists(false);
        setForm(emptyForm);
        return;
      }

      if (!healthResponse.ok) {
        throw new Error("Unable to load your health profile.");
      }

      const healthResult: unknown = await healthResponse.json();

      if (!healthResult || typeof healthResult !== "object") {
        throw new Error("The health profile response is invalid.");
      }

      const healthData = healthResult as Profile;

      setHealthProfile(healthData);
      setHealthProfileExists(true);
      setForm(toProfileForm(healthData));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const fullName =
    textValue(account?.full_name) ??
    textValue(account?.name) ??
    "Name not provided";

  const email = textValue(account?.email) ?? "Email not provided";

  const dateOfBirth =
    textValue(healthProfile?.date_of_birth) ??
    textValue(healthProfile?.dob) ??
    textValue(healthProfile?.birth_date);

  const bloodGroup =
    textValue(healthProfile?.blood_group) ?? "Not provided";

  const waterGoal =
    textValue(account?.water_goal_liters) ??
    textValue(account?.water_goal) ??
    textValue(healthProfile?.water_goal_liters) ??
    textValue(healthProfile?.water_goal);

  const phone = textValue(account?.phone);

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = sessionStorage.getItem("sumancare_access_token");

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      return;
    }

    if (
      form.date_of_birth &&
      form.date_of_birth > new Date().toISOString().slice(0, 10)
    ) {
      setMessage("Date of birth cannot be in the future.");
      return;
    }

    const height = form.height_cm.trim();
    const weight = form.weight_kg.trim();

    if (
      height &&
      (!Number.isFinite(Number(height)) ||
        Number(height) <= 0 ||
        Number(height) > 300)
    ) {
      setMessage("Enter a valid height in centimetres.");
      return;
    }

    if (
      weight &&
      (!Number.isFinite(Number(weight)) ||
        Number(weight) <= 0 ||
        Number(weight) > 500)
    ) {
      setMessage("Enter a valid weight in kilograms.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        allergies: form.allergies.trim() || null,
      };

      const response = await fetch(`${API_BASE_URL}/profile/me`, {
        method: healthProfileExists ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(result, "Unable to save your health profile.")
        );
      }

      if (!result || typeof result !== "object") {
        throw new Error("The server returned an invalid save response.");
      }

      const saved = result as Profile;

      setHealthProfile(saved);
      setHealthProfileExists(true);
      setForm(toProfileForm(saved));
      setMessage("Your health profile was saved successfully.");
      setEditOpen(false);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to save your health profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    setLoggingOut(true);

    sessionStorage.removeItem("sumancare_access_token");
    sessionStorage.removeItem("sumancare_user");

    // Also clear known legacy keys, if previously used.
    localStorage.removeItem("sumancare_access_token");
    localStorage.removeItem("sumancare_user");

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef7f4] p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <Activity
            className="mx-auto mb-3 animate-pulse text-emerald-600"
            size={30}
          />
          <p className="font-medium text-slate-700">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef7f4] p-6">
        <div className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-sm">
          <UserRound
            className="mx-auto mb-4 text-emerald-600"
            size={36}
          />
          <h1 className="text-xl font-semibold text-slate-900">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error || "We could not load your profile."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Log in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef7f4] px-4 pb-32 pt-5 sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#d9f3e9]/70 blur-3xl" />
        <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#dff5f1]/80 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#24564d] shadow-sm transition hover:bg-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8ba29d]">
              SumanCare
            </p>
            <h1 className="mt-0.5 text-lg font-semibold text-[#173f38]">
              My Profile
            </h1>
          </div>

          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#24564d] shadow-sm transition hover:bg-white"
          >
            <Settings size={19} />
          </Link>
        </header>

        {/* Account details */}
        <section className="rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_25px_70px_rgba(20,70,60,0.10)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d9f3e9] to-[#bce8d8] ring-8 ring-white/50">
              <UserRound size={42} className="text-[#008f6b]" />
            </div>

            <div className="mt-5 min-w-0 sm:ml-5 sm:mt-0">
              <p className="text-sm font-medium text-[#7a9690]">
                Patient Profile
              </p>
              <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-[#173f38]">
                {fullName}
              </h2>
              <p className="mt-1 break-all text-sm text-[#78908b]">
                {email}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e8f8f2] px-3 py-1.5 text-xs font-medium text-[#008f6b]">
                <ShieldCheck size={14} />
                Signed in
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(healthProfile ? toProfileForm(healthProfile) : emptyForm);
                setMessage("");
                setEditOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dceee8] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#247565] shadow-sm transition hover:bg-white sm:ml-auto sm:mt-0"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          </div>
        </section>

        {/* Personal information */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Personal information
            </h2>
            <p className="mt-1 text-xs text-[#819893]">
              Details saved to your account
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound size={19} />}
              label="Age"
              value={getAge(dateOfBirth)}
            />
            <InfoCard
              icon={<HeartPulse size={19} />}
              label="Blood Group"
              value={bloodGroup}
            />
            <InfoCard
              icon={<CalendarDays size={19} />}
              label="Date of Birth"
              value={formatDate(dateOfBirth)}
            />
            <InfoCard
              icon={<Activity size={19} />}
              label="Height"
              value={
                healthProfile?.height_cm != null
                  ? `${healthProfile.height_cm} cm`
                  : "Not provided"
              }
            />
            <InfoCard
              icon={<HeartPulse size={19} />}
              label="Weight"
              value={
                healthProfile?.weight_kg != null
                  ? `${healthProfile.weight_kg} kg`
                  : "Not provided"
              }
            />
            <InfoCard
              icon={<Mail size={19} />}
              label="Email"
              value={email}
            />
          </div>
        </section>

        {/* Additional information */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Additional information
            </h2>
            <p className="mt-1 text-xs text-[#819893]">
              Information available in your health profile
            </p>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
                <HeartPulse size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#829892]">Known allergies</p>
                <p className="mt-1 break-words font-semibold text-[#214941]">
                  {textValue(healthProfile?.allergies) ?? "Not provided"}
                </p>
              </div>
            </div>

            <div className="my-5 h-px bg-[#edf3f1]" />

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
                <Phone size={21} />
              </div>
              <div>
                <p className="text-xs text-[#829892]">Phone</p>
                <p className="mt-1 font-semibold text-[#214941]">
                  {phone ?? "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Quick actions
            </h2>
            <p className="mt-1 text-xs text-[#819893]">
              Access important health information
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-sm">
            <ActionRow
              icon={<ShieldCheck size={19} />}
              title="Emergency Health Card"
              subtitle="View your emergency information"
              href="/emergency"
            />
            <ActionRow
              icon={<HeartPulse size={19} />}
              title="Health History"
              subtitle="Review your health records"
              href="/reports"
            />
            <ActionRow
              icon={<Settings size={19} />}
              title="Settings"
              subtitle="Manage your preferences"
              href="/settings"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] border border-red-100 bg-white/70 py-4 text-sm font-medium text-red-500 shadow-sm transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Log out
        </button>

        <div className="py-8 text-center">
          <p className="text-xs font-medium text-[#9aaca8]">SumanCare</p>
          <p className="mt-1 text-[11px] text-[#b0bfbb]">
            Your health, intelligently monitored.
          </p>
        </div>
      </div>

      {/* Edit profile form */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#173f38]/20 p-3 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProfile}
            className="my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[30px] border border-white/80 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8aa19c]">
                  SumanCare
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#173f38]">
                  Edit health profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setMessage("");
                }}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f8f6]"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Add or update your health details. Fields can be left blank if
              you do not wish to provide them.
            </p>

            <div className="mt-6 space-y-4">
              <FormField label="Date of birth">
                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.date_of_birth}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date_of_birth: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Gender">
                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gender: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select if you wish</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </FormField>

              <FormField label="Blood group">
                <select
                  value={form.blood_group}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      blood_group: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Not provided</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    )
                  )}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Height (cm)">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        height_cm: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Weight (kg)">
                  <input
                    type="number"
                    min="0.1"
                    max="500"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        weight_kg: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>

              <FormField label="Allergies">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.allergies}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      allergies: event.target.value,
                    }))
                  }
                  placeholder="List known allergies, or leave blank"
                  className={inputClass}
                />
              </FormField>
            </div>

            {message && (
              <p role="status" className="mt-4 text-sm text-rose-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-[#008f6b] py-3.5 text-sm font-semibold text-white transition hover:bg-[#007e5e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {/* Logout confirmation */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173f38]/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[30px] border border-white/80 bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1ef] text-[#e56c61]">
              <LogOut size={23} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#173f38]">
              Log out?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#819893]">
              You can sign back in anytime to continue using SumanCare.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-2xl border border-[#e2eeeb] py-3 text-sm font-semibold text-[#41645c]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-2xl bg-[#e56c61] py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save feedback */}
      {message && !editOpen && (
        <div
          role="status"
          className="fixed bottom-5 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-4 text-center text-sm text-[#247565] shadow-lg"
        >
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#dfeee9] bg-[#f8fcfa] px-4 py-3 text-sm text-[#214941] outline-none focus:border-[#75c8ae] focus:ring-4 focus:ring-[#dff5ed]";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[#41645c]">
      {label}
      {children}
    </label>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#829892]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#214941]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border-b border-[#edf3f1] p-5 transition last:border-b-0 hover:bg-[#f7fbfa]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#214941]">{title}</p>
          <p className="mt-1 truncate text-xs text-[#829892]">{subtitle}</p>
        </div>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-[#9aafaa] transition group-hover:translate-x-0.5"
      />
    </Link>
  );
}
