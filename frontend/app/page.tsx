"use client";

import Link from "next/link";

import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Droplets,
  HeartPulse,
  Home,
  MessageCircle,
  MoreVertical,
  Pill,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4fafa] text-[#14201d]">
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        {/* Main app container */}
        <div className="min-h-[calc(100vh-32px)] overflow-hidden rounded-[32px] border border-white/80 bg-white/70 shadow-[0_20px_80px_rgba(24,67,60,0.08)] backdrop-blur-xl">

          {/* ================= HEADER ================= */}
          <header className="flex items-center justify-between px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <span className="text-xl">☰</span>
              </button>

              <div className="hidden sm:block">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Health intelligence
                </p>

                <h1 className="text-lg font-semibold tracking-tight">
                  SumanCare
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <Bell size={19} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <MoreVertical size={19} strokeWidth={1.8} />
              </button>

            </div>
          </header>

          {/* ================= HERO ================= */}
          <section className="px-5 pb-7 pt-4 sm:px-8 lg:px-12">

            <div className="mx-auto max-w-5xl text-center">

              <p className="mb-3 text-sm font-medium text-slate-400">
                Sunday, September 13
              </p>

              <h2 className="text-3xl font-medium tracking-tight text-slate-800 sm:text-5xl">
                Hey, Vaibhav!
              </h2>

              <p className="mt-2 text-lg text-slate-400 sm:text-xl">
                How can I help you{" "}
                <span className="font-medium text-emerald-600">
                  today?
                </span>
              </p>

              {/* AI Orb */}
              <div className="relative mx-auto mt-8 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">

                <div className="absolute inset-0 rounded-full bg-emerald-100/50 blur-2xl" />

                <div className="absolute h-28 w-28 rounded-full bg-gradient-to-br from-emerald-300 via-emerald-600 to-teal-950 shadow-[0_15px_45px_rgba(16,185,129,0.28)] sm:h-36 sm:w-36" />

                <div className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle_at_35%_25%,#caffec_0%,#24c995_22%,#08785c_55%,#063f35_100%)] shadow-inner sm:h-32 sm:w-32" />

                <div className="absolute h-14 w-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,#effff9,#50e3b1_35%,#08785c_80%)] blur-[1px] sm:h-20 sm:w-20" />

                <Sparkles
                  className="relative text-white/90"
                  size={26}
                  strokeWidth={1.5}
                />

              </div>

              <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-slate-400">
                Your personal health intelligence companion. Understand your
                health patterns before they become problems.
              </p>

            </div>

            {/* ================= FEATURE CARDS ================= */}
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* AI HEALTH RISK */}
              <FeatureCard
                icon={<ShieldAlert size={21} />}
                title="AI Health Risk"
                subtitle="Smart insight"
                value="28"
                suffix="/100"
                accent="emerald"
                href="/health-risk"
              />

              {/* MEDICINE */}
              <FeatureCard
                icon={<Pill size={21} />}
                title="Medicine"
                subtitle="Today's schedule"
                value="2/2"
                suffix="taken"
                accent="blue"
              />

              {/* DAILY HEALTH */}
              <FeatureCard
                icon={<Activity size={21} />}
                title="Daily Health"
                subtitle="Performance"
                value="+4.2"
                suffix="%"
                accent="purple"
              />

              {/* EMERGENCY */}
              <FeatureCard
                icon={<ShieldAlert size={21} />}
                title="Emergency"
                subtitle="Ready when needed"
                value="Card"
                suffix=""
                accent="rose"
              />

            </div>
          </section>

          {/* ================= HEALTH INTELLIGENCE ================= */}
          <section className="border-t border-slate-100/80 bg-white/50 px-5 py-8 sm:px-8 lg:px-12">

            <div className="mx-auto max-w-5xl">

              <div className="mb-5 flex items-end justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Today's snapshot
                  </p>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    Your health at a glance
                  </h3>
                </div>

                <Link
                  href="/health-risk"
                  className="hidden items-center gap-1 text-sm font-medium text-slate-400 transition hover:text-emerald-600 sm:flex"
                >
                  View details
                  <ChevronRight size={16} />
                </Link>

              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">

                {/* ================= RISK CARD ================= */}
                <div className="relative overflow-hidden rounded-[28px] bg-[#eaf8f3] p-6 sm:p-7">

                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-2xl" />

                  <div className="relative">

                    <div className="flex items-start justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-emerald-600">
                            <HeartPulse size={18} />
                          </div>

                          <span className="text-sm font-semibold text-slate-600">
                            AI Health Risk
                          </span>

                        </div>

                        <div className="mt-6 flex items-end gap-2">

                          <span className="text-6xl font-semibold tracking-[-0.06em] text-slate-800">
                            28
                          </span>

                          <span className="mb-2 text-sm text-slate-400">
                            / 100
                          </span>

                        </div>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">

                          <span className="h-2 w-2 rounded-full bg-emerald-500" />

                          <span className="text-xs font-semibold text-emerald-700">
                            Low risk
                          </span>

                        </div>

                      </div>

                      <div className="hidden h-24 w-24 items-center justify-center rounded-full border-[8px] border-emerald-200 sm:flex">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700">
                          28%
                        </div>

                      </div>

                    </div>

                    <div className="mt-7">

                      <div className="mb-2 flex justify-between text-xs text-slate-400">
                        <span>Current risk level</span>
                        <span>Stable</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/80">
                        <div className="h-full w-[28%] rounded-full bg-emerald-500" />
                      </div>

                    </div>

                    {/* CLICKABLE */}
                    <Link
                      href="/health-risk"
                      className="mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:gap-3"
                    >
                      Why did my score change?
                      <ArrowRight size={16} />
                    </Link>

                  </div>
                </div>

                {/* ================= METRICS ================= */}
                <div className="grid grid-cols-2 gap-4">

                  <MetricCard
                    icon={<HeartPulse size={18} />}
                    label="Blood Pressure"
                    value="118/76"
                    unit="mmHg"
                    trend="Normal"
                  />

                  <MetricCard
                    icon={<Activity size={18} />}
                    label="Heart Rate"
                    value="72"
                    unit="BPM"
                    trend="Normal"
                  />

                  <MetricCard
                    icon={<Droplets size={18} />}
                    label="Water"
                    value="1.8"
                    unit="/ 2.5 L"
                    trend="72%"
                  />

                  <MetricCard
                    icon={<TrendingUp size={18} />}
                    label="Activity"
                    value="6,420"
                    unit="steps"
                    trend="+8%"
                  />

                </div>

              </div>
            </div>
          </section>

          {/* ================= LOWER CARDS ================= */}
          <section className="px-5 pb-10 sm:px-8 lg:px-12">

            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">

              {/* AI INSIGHT */}
              <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.05)] ring-1 ring-slate-100">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      AI Insight
                    </p>

                    <p className="text-xs text-slate-400">
                      Just for you
                    </p>
                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Your activity is improving this week. Keeping your sleep
                  consistent could help maintain your current risk level.
                </p>

                <Link
                  href="/health-risk"
                  className="mt-4 inline-block text-sm font-semibold text-emerald-600"
                >
                  View insight →
                </Link>

              </div>

              {/* APPOINTMENT */}
              <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_40px_rgba(20,50,45,0.05)] ring-1 ring-slate-100">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Next appointment
                    </p>

                    <p className="text-xs text-slate-400">
                      Upcoming
                    </p>
                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold">
                      Dr. Ananya Sharma
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      General Physician
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">

                    <p className="text-[10px] font-semibold text-slate-400">
                      SEP
                    </p>

                    <p className="text-lg font-bold">
                      18
                    </p>

                  </div>

                </div>
              </div>

              {/* EMERGENCY */}
              <Link
                href="/emergency"
                className="group rounded-[26px] bg-[#fff6f5] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                    <ShieldAlert size={19} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-red-300 transition group-hover:translate-x-1 group-hover:text-red-500"
                  />

                </div>

                <p className="mt-5 text-sm font-semibold text-slate-800">
                  Emergency Health Card
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Your critical information, available instantly.
                </p>

              </Link>

            </div>
          </section>

          {/* ================= BOTTOM NAVIGATION ================= */}
          <nav className="sticky bottom-0 border-t border-slate-100 bg-white/90 px-5 py-3 backdrop-blur-xl sm:hidden">

            <div className="flex items-center justify-around">

              <BottomNavItem
                icon={<Home size={20} />}
                label="Home"
                active
              />

              <BottomNavItem
                icon={<Activity size={20} />}
                label="Health"
              />

              <BottomNavItem
                icon={<MessageCircle size={20} />}
                label="AI"
                center
              />

              <BottomNavItem
                icon={<Pill size={20} />}
                label="Medicine"
              />

              <BottomNavItem
                icon={<UserRound size={20} />}
                label="Profile"
              />

            </div>
          </nav>

        </div>
      </div>
    </main>
  );
}

/* ================================================= */
/* FEATURE CARD */
/* ================================================= */

function FeatureCard({
  icon,
  title,
  subtitle,
  value,
  suffix,
  accent,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  suffix: string;
  accent: "emerald" | "blue" | "purple" | "rose";
  href?: string;
}) {
  const styles = {
    emerald: "bg-[#edf9f5] text-emerald-600",
    blue: "bg-[#eff7ff] text-blue-600",
    purple: "bg-[#f6f1ff] text-purple-600",
    rose: "bg-[#fff2f1] text-rose-500",
  };

  const cardClass =
    "group block rounded-[26px] bg-white p-5 text-left shadow-[0_8px_35px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(20,50,45,0.08)]";

  const content = (
    <>
      <div className="flex items-start justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${styles[accent]}`}
        >
          {icon}
        </div>

        <ArrowRight
          size={16}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
        />

      </div>

      <p className="mt-5 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

      <div className="mt-4">

        <span className="text-2xl font-semibold tracking-tight text-slate-800">
          {value}
        </span>

        {suffix && (
          <span className="ml-1 text-xs text-slate-400">
            {suffix}
          </span>
        )}

      </div>
    </>
  );

  /* If href exists → real Next.js navigation */
  if (href) {
    return (
      <Link
        href={href}
        className={cardClass}
      >
        {content}
      </Link>
    );
  }

  /* Otherwise → normal non-clickable card */
  return (
    <div className={cardClass}>
      {content}
    </div>
  );
}

/* ================================================= */
/* METRIC CARD */
/* ================================================= */

function MetricCard({
  icon,
  label,
  value,
  unit,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  trend: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(20,50,45,0.04)] ring-1 ring-slate-100">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500">
          {icon}
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
          {trend}
        </span>

      </div>

      <p className="mt-4 text-xs text-slate-400">
        {label}
      </p>

      <div className="mt-1">

        <span className="text-xl font-semibold text-slate-800">
          {value}
        </span>

        <span className="ml-1 text-[10px] text-slate-400">
          {unit}
        </span>

      </div>

    </div>
  );
}

/* ================================================= */
/* BOTTOM NAVIGATION */
/* ================================================= */

function BottomNavItem({
  icon,
  label,
  active = false,
  center = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  center?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-1 text-[10px] ${
        active ? "text-emerald-600" : "text-slate-400"
      }`}
    >

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          center
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
            : ""
        }`}
      >
        {icon}
      </div>

      <span>{label}</span>

    </button>
  );
}