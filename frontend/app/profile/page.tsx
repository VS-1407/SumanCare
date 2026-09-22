"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Droplets,
  HeartPulse,
  LogOut,
  Phone,
  Pencil,
  ShieldCheck,
  Settings,
  Stethoscope,
  UserRound,
  X,
  CalendarDays,
  Mail,
} from "lucide-react";

export default function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#eef7f4] px-4 pb-32 pt-5 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#d9f3e9]/70 blur-3xl" />
        <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#dff5f1]/80 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#24564d] shadow-sm backdrop-blur-xl transition duration-200 hover:scale-105 hover:bg-white"
            aria-label="Back to dashboard"
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#24564d] shadow-sm backdrop-blur-xl transition duration-200 hover:scale-105 hover:bg-white"
            aria-label="Settings"
          >
            <Settings size={19} />
          </Link>
        </header>

        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_25px_70px_rgba(20,70,60,0.10)] backdrop-blur-xl sm:p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#d8f3e8]/70 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#dff5f1]/80 blur-3xl" />

          <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#d9f3e9] to-[#bce8d8] shadow-inner ring-8 ring-white/50">
                <UserRound
                  size={42}
                  strokeWidth={1.7}
                  className="text-[#008f6b]"
                />
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-[#16a56f]" />
            </div>

            <div className="mt-5 sm:ml-5 sm:mt-0">
              <p className="text-sm font-medium text-[#7a9690]">
                Patient Profile
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173f38]">
                Vaibhav Suryavanshi
              </h2>

              <p className="mt-1 text-sm text-[#78908b]">
                SumanCare Member
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e8f8f2] px-3 py-1.5 text-xs font-medium text-[#008f6b]">
                <ShieldCheck size={14} />
                Health profile active
              </div>
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dceee8] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#247565] shadow-sm transition hover:bg-white hover:shadow-md sm:ml-auto sm:mt-0"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Personal information
            </h2>

            <p className="mt-1 text-xs text-[#819893]">
              Your basic health profile information
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound size={19} />}
              label="Age"
              value="21 years"
            />

            <InfoCard
              icon={<HeartPulse size={19} />}
              label="Blood Group"
              value="O+"
            />

            <InfoCard
              icon={<Droplets size={19} />}
              label="Water Goal"
              value="2.5 L / day"
            />

            <InfoCard
              icon={<ShieldCheck size={19} />}
              label="Health Status"
              value="Monitoring active"
            />

            <InfoCard
              icon={<CalendarDays size={19} />}
              label="Date of Birth"
              value="15 August 2005"
            />

            <InfoCard
              icon={<Mail size={19} />}
              label="Email"
              value="vaibhav@example.com"
            />
          </div>
        </section>

        {/* Health Information */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Health information
            </h2>

            <p className="mt-1 text-xs text-[#819893]">
              Important information used by SumanCare
            </p>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(20,70,60,0.07)] backdrop-blur-xl">
            {/* Condition */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
                <HeartPulse size={21} />
              </div>

              <div>
                <p className="text-xs text-[#829892]">
                  Known condition
                </p>

                <p className="mt-1 font-semibold text-[#214941]">
                  Type 2 Diabetes
                </p>

                <p className="mt-0.5 text-xs text-[#829892]">
                  Under regular health monitoring
                </p>
              </div>
            </div>

            <div className="my-5 h-px bg-[#edf3f1]" />

            {/* Doctor */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b]">
                <Stethoscope size={21} />
              </div>

              <div>
                <p className="text-xs text-[#829892]">
                  Treating doctor
                </p>

                <p className="mt-1 font-semibold text-[#214941]">
                  Dr. Ananya Sharma
                </p>

                <p className="mt-0.5 text-xs text-[#829892]">
                  General Physician · CityCare Hospital
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Emergency contact
            </h2>

            <p className="mt-1 text-xs text-[#819893]">
              Someone SumanCare can identify in an emergency
            </p>
          </div>

          <div className="flex items-center justify-between rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(20,70,60,0.07)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1ef] text-[#e56c61]">
                <Phone size={20} />
              </div>

              <div>
                <p className="text-xs text-[#829892]">
                  Emergency contact
                </p>

                <p className="mt-1 font-semibold text-[#214941]">
                  Family Contact
                </p>

                <p className="mt-0.5 text-xs text-[#829892]">
                  +91 XXXXX XXXXX
                </p>
              </div>
            </div>

            <Link
              href="/emergency"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef8f5] text-[#008f6b] transition hover:scale-105 hover:bg-[#e2f5ee]"
              aria-label="Open emergency health card"
            >
              <ChevronRight size={19} />
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-base font-semibold text-[#173f38]">
              Quick actions
            </h2>

            <p className="mt-1 text-xs text-[#819893]">
              Access important health information
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_18px_50px_rgba(20,70,60,0.07)] backdrop-blur-xl">
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
              subtitle="Manage your SumanCare preferences"
              href="/settings"
            />
          </div>
        </section>

        {/* Logout */}
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] border border-red-100 bg-white/70 py-4 text-sm font-medium text-red-500 shadow-sm transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Log out
        </button>

        {/* Footer */}
        <div className="py-8 text-center">
          <p className="text-xs font-medium text-[#9aaca8]">
            SumanCare
          </p>

          <p className="mt-1 text-[11px] text-[#b0bfbb]">
            Your health, intelligently monitored.
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173f38]/15 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_30px_100px_rgba(20,70,60,0.20)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8aa19c]">
                  SumanCare
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#173f38]">
                  Edit profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f8f6] text-[#55746c] transition hover:bg-[#e8f3ef]"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InputField
                label="Full name"
                defaultValue="Vaibhav Suryavanshi"
              />

              <InputField
                label="Email"
                defaultValue="vaibhav@example.com"
                type="email"
              />

              <InputField
                label="Water goal"
                defaultValue="2.5 L / day"
              />
            </div>

            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="mt-6 w-full rounded-2xl bg-[#008f6b] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,143,107,0.20)] transition hover:bg-[#007e5e]"
            >
              Save changes
            </button>

            <p className="mt-3 text-center text-[11px] text-[#9aaea9]">
              Profile data will be connected to your account later.
            </p>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173f38]/15 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[30px] border border-white/80 bg-white p-6 text-center shadow-[0_30px_100px_rgba(20,70,60,0.20)]">
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
                className="rounded-2xl border border-[#e2eeeb] bg-white py-3 text-sm font-semibold text-[#41645c] transition hover:bg-[#f7fbfa]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="rounded-2xl bg-[#e56c61] py-3 text-sm font-semibold text-white transition hover:bg-[#d85d53]"
              >
                Log out
              </button>
            </div>

            <p className="mt-4 text-[11px] text-[#a2b2ae]">
              Authentication will be connected later.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

/* --------------------------------
   Information Card
-------------------------------- */

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
    <div className="group flex items-center gap-4 rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_15px_40px_rgba(20,70,60,0.06)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(20,70,60,0.09)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b] transition group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#829892]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-[#214941]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------
   Action Row
-------------------------------- */

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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8f2] text-[#008f6b] transition group-hover:scale-105">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#214941]">
            {title}
          </p>

          <p className="mt-1 truncate text-xs text-[#829892]">
            {subtitle}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-[#9aafaa] transition group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* --------------------------------
   Input Field
-------------------------------- */

function InputField({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#66817a]">
        {label}
      </label>

      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-[#dfeee9] bg-[#f8fcfa] px-4 py-3.5 text-sm text-[#214941] outline-none transition placeholder:text-[#a1b3ae] focus:border-[#75c8ae] focus:bg-white focus:ring-4 focus:ring-[#dff5ed]"
      />
    </div>
  );
}