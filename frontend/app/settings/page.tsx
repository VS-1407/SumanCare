
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  UserRound,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const settingsItems = [
    {
      title: "Profile",
      description: "Manage your personal and health details",
      icon: UserRound,
      href: "/profile",
    },
    {
      title: "Notifications",
      description: "Manage reminders and alerts",
      icon: Bell,
      href: null,
    },
    {
      title: "Privacy & Security",
      description: "Keep your account secure",
      icon: ShieldCheck,
      href: null,
    },
  ];

  function handleLogout() {
    sessionStorage.removeItem("sumancare_access_token");
    localStorage.removeItem("sumancare_access_token");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#20483f] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#52756c] hover:text-[#20483f]"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Settings size={27} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-[#6b857e]">
              Manage your SumanCare preferences
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#e1ebe5] bg-white">
          <div className="border-b border-[#e8efeb] px-5 py-4">
            <h2 className="font-semibold">Account & Preferences</h2>
          </div>

          {settingsItems.map((item) => {
            const Icon = item.icon;

            const content = (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5f0]">
                  <Icon size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-[#71877f]">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={19} className="shrink-0 text-[#80958d]" />
              </>
            );

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 border-b border-[#e8efeb] px-5 py-4 last:border-b-0"
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex w-full items-center gap-4"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex w-full items-center gap-4">
                    {content}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <LogOut size={21} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-[#20483f]">Log out</h2>
              <p className="mt-1 text-sm text-[#71877f]">
                Sign out of your SumanCare account
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Log out
            </button>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#81958d]">
          SumanCare · Your health, in one place
        </p>
      </div>
    </main>
  );
}
