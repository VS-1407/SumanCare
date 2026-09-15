"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Check,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Save,
  Sparkles,
  Utensils,
  Weight,
  Dumbbell,
  Brain,
  Pill,
} from "lucide-react";
import { useState } from "react";

export default function HealthPage() {
  const [glucoseType, setGlucoseType] = useState("Fasting");
  const [stress, setStress] = useState("Moderate");
  const [mealQuality, setMealQuality] = useState("Good");
  const [medication, setMedication] = useState("Taken");
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
                  Health tracking
                </p>

                <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                  Daily Health
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-10 items-center gap-2 rounded-full bg-emerald-50 px-4 text-xs font-semibold text-emerald-700">
                <Activity size={15} />
                Today's check-in
              </div>
            </div>
          </header>

          {/* ================= INTRO ================= */}
          <section className="px-5 pb-6 pt-7 sm:px-8">

            <div className="mx-auto max-w-3xl">
              <div className="rounded-[28px] bg-gradient-to-br from-[#eaf8f3] to-[#f4fbf9] p-6 sm:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                      <HeartPulse size={21} />
                    </div>

                    <p className="text-sm font-semibold text-emerald-700">
                      Sunday, September 13
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                      How are you feeling today?
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                      Record your health and lifestyle information to help
                      SumanCare understand your health patterns over time.
                    </p>
                  </div>

                  <div className="hidden h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-sm sm:flex">
                    <HeartPulse
                      size={38}
                      strokeWidth={1.4}
                      className="text-emerald-500"
                    />
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* ================= FORM ================= */}
          <section className="px-5 pb-10 sm:px-8">

            <div className="mx-auto max-w-3xl space-y-5">

              {/* ================= VITALS ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<HeartPulse size={18} />}
                  title="Vitals"
                  subtitle="Record today's basic health measurements"
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  {/* Blood Pressure */}
                  <InputCard
                    icon={<HeartPulse size={18} />}
                    title="Blood Pressure"
                    subtitle="Systolic / Diastolic"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="118"
                        className="health-input"
                      />

                      <span className="text-slate-300">/</span>

                      <input
                        type="number"
                        placeholder="76"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        mmHg
                      </span>
                    </div>
                  </InputCard>

                  {/* Blood Glucose */}
                  <InputCard
                    icon={<Activity size={18} />}
                    title="Blood Glucose"
                    subtitle="Optional daily reading"
                  >
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

                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Fasting", "Before meal", "After meal", "Random"].map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setGlucoseType(type)}
                            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                              glucoseType === type
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </InputCard>

                  {/* Heart Rate */}
                  <InputCard
                    icon={<Activity size={18} />}
                    title="Heart Rate"
                    subtitle="Resting heart rate"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="72"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        BPM
                      </span>
                    </div>
                  </InputCard>

                  {/* Weight */}
                  <InputCard
                    icon={<Weight size={18} />}
                    title="Weight"
                    subtitle="Current body weight"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="68"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        kg
                      </span>
                    </div>
                  </InputCard>

                </div>
              </section>

              {/* ================= LIFESTYLE ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<Sparkles size={18} />}
                  title="Lifestyle"
                  subtitle="Small daily habits help us understand bigger patterns"
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  {/* Sleep */}
                  <InputCard
                    icon={<Moon size={18} />}
                    title="Sleep"
                    subtitle="Last night's sleep"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="7.5"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        hours
                      </span>
                    </div>
                  </InputCard>

                  {/* Water */}
                  <InputCard
                    icon={<Droplets size={18} />}
                    title="Water Intake"
                    subtitle="Total water consumed"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="1.8"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        liters
                      </span>
                    </div>
                  </InputCard>

                  {/* Steps */}
                  <InputCard
                    icon={<Footprints size={18} />}
                    title="Steps"
                    subtitle="Today's physical activity"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="6420"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        steps
                      </span>
                    </div>
                  </InputCard>

                  {/* Exercise */}
                  <InputCard
                    icon={<Dumbbell size={18} />}
                    title="Exercise"
                    subtitle="Dedicated exercise time"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="30"
                        className="health-input"
                      />

                      <span className="text-xs text-slate-400">
                        minutes
                      </span>
                    </div>
                  </InputCard>

                </div>

                {/* Stress */}
                <div className="mt-4 rounded-[22px] bg-slate-50/70 p-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-purple-500">
                      <Brain size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Stress Level
                      </p>

                      <p className="text-xs text-slate-400">
                        How stressed did you feel today?
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {["Low", "Moderate", "High"].map((level) => (
                      <ChoiceButton
                        key={level}
                        label={level}
                        active={stress === level}
                        onClick={() => setStress(level)}
                      />
                    ))}
                  </div>

                </div>

                {/* Meal Quality */}
                <div className="mt-4 rounded-[22px] bg-slate-50/70 p-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-500">
                      <Utensils size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Meal Quality
                      </p>

                      <p className="text-xs text-slate-400">
                        How would you rate today's meals?
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {["Poor", "Average", "Good"].map((quality) => (
                      <ChoiceButton
                        key={quality}
                        label={quality}
                        active={mealQuality === quality}
                        onClick={() => setMealQuality(quality)}
                      />
                    ))}
                  </div>

                </div>

              </section>

              {/* ================= MEDICATION ================= */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                <SectionHeader
                  icon={<Pill size={18} />}
                  title="Medication"
                  subtitle="Keep track of today's medication adherence"
                />

                <div className="mt-6 rounded-[22px] bg-blue-50/50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                      <Pill size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Today's medication
                      </p>

                      <p className="text-xs text-slate-400">
                        Did you take your scheduled medicines?
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 flex gap-2">
                    <ChoiceButton
                      label="Taken"
                      active={medication === "Taken"}
                      onClick={() => setMedication("Taken")}
                    />

                    <ChoiceButton
                      label="Missed"
                      active={medication === "Missed"}
                      onClick={() => setMedication("Missed")}
                    />
                  </div>

                </div>

              </section>

              {/* ================= AI PREVIEW ================= */}
              <section className="overflow-hidden rounded-[28px] bg-[#eaf8f3] p-6 sm:p-7">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      SumanCare Intelligence
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                      Your daily data helps reveal health patterns.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Once connected to your health-risk model, SumanCare
                      will analyze your trends and highlight important changes
                      instead of relying on a single reading.
                    </p>
                  </div>

                </div>

              </section>

              {/* ================= SAVE BUTTON ================= */}
              <div className="pb-4">

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700 hover:shadow-[0_16px_35px_rgba(16,185,129,0.28)]"
                >
                  {saved ? (
                    <>
                      <Check size={18} />
                      Health Check-in Saved
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Today's Health
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  Your health information is intended for monitoring and
                  health insights, not medical diagnosis.
                </p>

              </div>

            </div>
          </section>

        </div>
      </div>

      {/* Custom input styling */}
      <style jsx global>{`
        .health-input {
          width: 100%;
          min-width: 0;
          border-radius: 14px;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 10px 12px;
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

        .health-input::-webkit-inner-spin-button,
        .health-input::-webkit-outer-spin-button {
          opacity: 0.5;
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

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
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
/* INPUT CARD */
/* ================================================= */

function InputCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-slate-50/70 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>

      </div>

      <div className="mt-4">
        {children}
      </div>

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
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-white text-slate-400 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      {label}
    </button>
  );
}