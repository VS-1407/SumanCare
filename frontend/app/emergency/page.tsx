"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  UserRound,
  HeartPulse,
  ShieldAlert,
  Pill,
  Droplets,
  AlertTriangle,
  Share2,
  CheckCircle2,
} from "lucide-react";

export default function EmergencyPage() {
  return (
    <main className="min-h-screen bg-[#f7fbfb] px-4 py-5 text-slate-900">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center">
            <p className="text-lg font-bold">Emergency Health Card</p>
            <p className="text-xs text-slate-400">
              Important information at a glance
            </p>
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
            <Share2 size={17} />
          </button>
        </div>

        {/* EMERGENCY ALERT */}
        <section className="mb-5 rounded-[28px] bg-red-50 p-5 ring-1 ring-red-100">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldAlert size={21} />
            </div>

            <div>
              <p className="font-bold text-red-700">
                Emergency Information
              </p>
              <p className="mt-1 text-xs leading-5 text-red-600/80">
                Show this card to emergency medical personnel when immediate
                health information is needed.
              </p>
            </div>
          </div>
        </section>

        {/* PATIENT CARD */}
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <UserRound size={28} />
            </div>

            <div>
              <p className="text-xl font-bold">Vaibhav Suryavanshi</p>
              <p className="mt-1 text-xs text-slate-400">
                Patient Health Profile
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoBox
              icon={<Droplets size={17} />}
              label="Blood Group"
              value="O+"
            />

            <InfoBox
              icon={<HeartPulse size={17} />}
              label="Heart Rate"
              value="72 BPM"
            />
          </div>
        </section>

        {/* CRITICAL INFORMATION */}
        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<AlertTriangle size={18} />}
            title="Critical Information"
          />

          <div className="mt-5 space-y-3">
            <InfoRow
              label="Known Conditions"
              value="Type 2 Diabetes"
            />

            <InfoRow
              label="Allergies"
              value="No known allergies"
            />

            <InfoRow
              label="Current Medication"
              value="Metformin 500 mg"
            />

            <InfoRow
              label="Last HbA1c"
              value="6.8%"
            />
          </div>
        </section>

        {/* DOCTOR */}
        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<UserRound size={18} />}
            title="Treating Doctor"
          />

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-sm font-bold">Dr. Ananya Sharma</p>
              <p className="mt-1 text-xs text-slate-400">
                General Physician
              </p>
              <p className="mt-1 text-xs text-slate-400">
                CityCare Hospital
              </p>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Phone size={18} />
            </button>
          </div>
        </section>

        {/* EMERGENCY CONTACT */}
        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<Phone size={18} />}
            title="Emergency Contact"
          />

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Family Emergency Contact</p>
              <p className="mt-1 text-xs text-slate-400">
                Primary emergency contact
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white">
              <Phone size={14} />
              Call
            </button>
          </div>
        </section>

        {/* LOCATION */}
        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<MapPin size={18} />}
            title="Current Location"
          />

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Location available
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  GPS location can be shared during an emergency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AMBULANCE BUTTON */}
        <button className="mb-5 flex w-full items-center justify-center gap-3 rounded-[24px] bg-red-600 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(220,38,38,0.18)] transition hover:bg-red-700">
          <Phone size={19} />
          Emergency Assistance
        </button>

        {/* SECURITY NOTE */}
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-5 text-emerald-700">
            Your emergency profile is designed to make important health
            information easier to access when every second matters.
          </p>
        </div>

        <p className="px-4 py-6 text-center text-[11px] leading-5 text-slate-400">
          SumanCare provides health information support and is not a
          substitute for professional medical care.
        </p>
      </div>
    </main>
  );
}

/* COMPONENTS */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-emerald-600">{icon}</div>
      <p className="text-sm font-bold">{title}</p>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-[11px]">{label}</p>
      </div>

      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="max-w-[55%] text-right text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}