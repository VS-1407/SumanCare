"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Droplets,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";

export default function DiabetesPage() {
  const [diabetesStatus, setDiabetesStatus] = useState("Not sure");
  const [glucoseType, setGlucoseType] = useState("Fasting");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#f4fafa] text-[#14201d]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-[1100px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-h-[calc(100vh-32px)] overflow-hidden rounded-[32px] border border-white/80 bg-white/70 shadow-[0_20px_80px_rgba(24,67,60,0.08)] backdrop-blur-xl">

          {/* ================= HEADER ================= */}
          <header className="flex items-center justify-between border-b border-slate-100/80 px-5 py-5 sm:px-8">

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-x-0.5 hover:shadow-md"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
                  Glucose care
                </p>

                <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                  Diabetes & Glucose
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-10 items-center gap-2 rounded-full bg-emerald-50 px-4 text-xs font-semibold text-emerald-700">
                <Activity size={15} />
                Health tracking
              </div>
            </div>

          </header>

          {/* ================= CONTENT ================= */}
          <section className="px-5 py-7 sm:px-8">

            <div className="mx-auto max-w-3xl space-y-5">

              {/* ================= INTRO ================= */}
              <section className="rounded-[28px] bg-gradient-to-br from-[#eaf8f3] to-[#f4fbf9] p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <Droplets size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Glucose & diabetes tracking
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                      Understand your glucose patterns
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                      Keep your diabetes-related information, glucose readings,
                      medication and check-ups organized in one place.
                    </p>
                  </div>

                </div>

              </section>

              {/* ================= DIABETES PROFILE ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<HeartPulse size={18} />}
                  title="Diabetes Profile"
                  subtitle="Tell SumanCare about your current health profile"
                />

                <div className="mt-6">

                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Diabetes status
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      "No known diabetes",
                      "Prediabetes",
                      "Type 1",
                      "Type 2",
                      "Gestational / Other",
                      "Not sure",
                    ].map((status) => (
                      <ChoiceButton
                        key={status}
                        label={status}
                        active={diabetesStatus === status}
                        onClick={() => setDiabetesStatus(status)}
                      />
                    ))}
                  </div>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <InputField
                    label="Diagnosis year"
                    placeholder="Optional"
                    type="number"
                  />

                  <InputField
                    label="Last diabetes check-up"
                    placeholder="Select date"
                    type="date"
                  />

                </div>

              </section>

              {/* ================= GLUCOSE ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<Droplets size={18} />}
                  title="Glucose Reading"
                  subtitle="Record today's glucose measurement"
                />

                <div className="mt-6 rounded-[24px] bg-[#f7fbfa] p-5">

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Glucose level
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="102"
                          className="health-input"
                        />

                        <span className="text-xs text-slate-400">
                          mg/dL
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Reading type
                      </label>

                      <select
                        value={glucoseType}
                        onChange={(e) => setGlucoseType(e.target.value)}
                        className="health-input"
                      >
                        <option>Fasting</option>
                        <option>Before meal</option>
                        <option>After meal</option>
                        <option>Random</option>
                      </select>
                    </div>

                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">

                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Sparkles size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Pattern-based insights
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        SumanCare will use repeated readings and lifestyle
                        patterns for AI-assisted insights. A single reading
                        does not diagnose diabetes.
                      </p>
                    </div>

                  </div>

                </div>

              </section>

              {/* ================= HBA1C ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<Activity size={18} />}
                  title="HbA1c"
                  subtitle="Add your latest laboratory result"
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <InputField
                    label="HbA1c"
                    placeholder="e.g. 5.8"
                    type="number"
                    step="0.1"
                  />

                  <InputField
                    label="Test date"
                    placeholder="Select date"
                    type="date"
                  />

                </div>

                <div className="mt-5 rounded-[20px] bg-blue-50/50 p-4">

                  <div className="flex gap-3">

                    <FileText
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      HbA1c is a laboratory measurement that reflects average
                      blood glucose over roughly the previous 2–3 months.
                    </p>

                  </div>

                </div>

              </section>

              {/* ================= MEDICATION ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <div className="flex items-center justify-between">

                  <SectionHeader
                    icon={<Pill size={18} />}
                    title="Diabetes Medication"
                    subtitle="Keep treatment information organized"
                  />

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                  >
                    <Plus size={18} />
                  </button>

                </div>

                <div className="mt-6 space-y-3">

                  <MedicineCard
                    name="Metformin"
                    dosage="500 mg"
                    schedule="After breakfast"
                  />

                  <MedicineCard
                    name="Glucose medication"
                    dosage="As prescribed"
                    schedule="Evening"
                  />

                </div>

              </section>

              {/* ================= DOCTOR ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<Stethoscope size={18} />}
                  title="Diabetes Care"
                  subtitle="Keep your treating specialist information available"
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <InputField
                    label="Doctor / Specialist"
                    placeholder="Doctor's name"
                  />

                  <InputField
                    label="Hospital / Clinic"
                    placeholder="Clinic name"
                  />

                  <InputField
                    label="Doctor contact"
                    placeholder="Phone number"
                    type="tel"
                  />

                  <InputField
                    label="Next review"
                    placeholder="Select date"
                    type="date"
                  />

                </div>

              </section>

              {/* ================= GLUCOSE HISTORY ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <div className="flex items-center justify-between">

                  <SectionHeader
                    icon={<Activity size={18} />}
                    title="Glucose History"
                    subtitle="Your recent recorded readings"
                  />

                  <Link
                    href="/health"
                    className="text-xs font-semibold text-emerald-600"
                  >
                    Add reading
                  </Link>

                </div>

                <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-100">

                  <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>Date</span>
                    <span>Type</span>
                    <span>Reading</span>
                    <span>Status</span>
                  </div>

                  <HistoryRow
                    date="Sep 13"
                    type="Fasting"
                    value="102 mg/dL"
                  />

                  <HistoryRow
                    date="Sep 12"
                    type="After meal"
                    value="138 mg/dL"
                  />

                  <HistoryRow
                    date="Sep 11"
                    type="Fasting"
                    value="98 mg/dL"
                  />

                  <HistoryRow
                    date="Sep 10"
                    type="Random"
                    value="121 mg/dL"
                  />

                </div>

              </section>

              {/* ================= AI INSIGHT ================= */}
              <section className="rounded-[28px] bg-[#eaf8f3] p-6 sm:p-7">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      SumanCare AI
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                      Glucose pattern insights will appear here
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      After enough health data is collected, the AI system can
                      identify changes across glucose, sleep, activity,
                      medication adherence and lifestyle data.
                    </p>

                  </div>

                </div>

              </section>

              {/* ================= SAVE ================= */}
              <div className="pb-4">

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700"
                >
                  {saved ? (
                    <>
                      <Check size={18} />
                      Diabetes Information Saved
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Diabetes Information
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  SumanCare provides health tracking and AI-assisted insights.
                  It does not diagnose or replace professional medical care.
                </p>

              </div>

            </div>
          </section>

        </div>
      </div>

      {/* Input styling */}
      <style jsx global>{`
        .health-input {
          width: 100%;
          min-width: 0;
          border-radius: 14px;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 11px 12px;
          font-size: 14px;
          font-weight: 600;
          color: rgb(51 65 85);
          outline: none;
          transition: all 0.2s;
        }

        .health-input:focus {
          border-color: rgb(52 211 153);
          box-shadow: 0 0 0 3px rgb(167 243 208 / 0.35);
        }

        .health-input::placeholder {
          color: rgb(148 163 184);
          font-weight: 500;
        }
      `}</style>
    </main>
  );
}

/* ================================================= */
/* SECTION HEADER */
/* ================================================= */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>

    </div>
  );
}

/* ================================================= */
/* INPUT FIELD */
/* ================================================= */

function InputField({
  label,
  placeholder,
  type = "text",
  step,
}: {
  label: string;
  placeholder: string;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        step={step}
        className="health-input"
      />
    </div>
  );
}

/* ================================================= */
/* CHOICE BUTTON */
/* ================================================= */

function ChoiceButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[16px] px-4 py-3 text-left text-xs font-semibold transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-400 ring-1 ring-slate-100 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      {label}
    </button>
  );
}

/* ================================================= */
/* MEDICINE CARD */
/* ================================================= */

function MedicineCard({
  name,
  dosage,
  schedule,
}: {
  name: string;
  dosage: string;
  schedule: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] bg-slate-50/70 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
          <Pill size={18} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">
            {name}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {dosage} · {schedule}
          </p>
        </div>

      </div>

      <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-600">
        Active
      </div>

    </div>
  );
}

/* ================================================= */
/* HISTORY ROW */
/* ================================================= */

function HistoryRow({
  date,
  type,
  value,
}: {
  date: string;
  type: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-4 items-center border-t border-slate-100 px-4 py-4 text-xs">

      <span className="font-medium text-slate-500">
        {date}
      </span>

      <span className="text-slate-400">
        {type}
      </span>

      <span className="font-semibold text-slate-700">
        {value}
      </span>

      <span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
          Recorded
        </span>
      </span>

    </div>
  );
}