"use client";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  Moon,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const riskData = [
  { day: "Mon", risk: 36 },
  { day: "Tue", risk: 34 },
  { day: "Wed", risk: 32 },
  { day: "Thu", risk: 31 },
  { day: "Fri", risk: 30 },
  { day: "Sat", risk: 29 },
  { day: "Sun", risk: 28 },
];

export default function HealthRiskPage() {
  return (
    <main className="min-h-screen bg-[#f4fafa] text-[#14201d]">
      <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-h-[calc(100vh-32px)] overflow-hidden rounded-[32px] border border-white bg-white/75 shadow-[0_20px_80px_rgba(24,67,60,0.08)] backdrop-blur-xl">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:scale-105"
              >
                <ArrowLeft size={19} />
              </a>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  SumanCare AI
                </p>

                <h1 className="text-lg font-semibold">
                  Health Intelligence
                </h1>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Brain size={20} />
            </div>
          </header>

          <div className="px-5 py-7 sm:px-8 lg:px-12">

            {/* Page introduction */}
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <Sparkles size={13} />
                  AI-assisted health analysis
                </div>

                <h2 className="text-3xl font-medium tracking-tight text-slate-800 sm:text-4xl">
                  Understand what your health data is telling you.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  SumanCare analyzes your recent health and lifestyle patterns
                  to identify changes that may deserve your attention.
                </p>
              </div>

              {/* Main risk section */}
              <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">

                {/* Score */}
                <div className="relative overflow-hidden rounded-[30px] bg-[#eaf8f3] p-7">
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-emerald-600">
                          <ShieldCheck size={18} />
                        </div>

                        <span className="text-sm font-semibold text-slate-600">
                          Current risk
                        </span>
                      </div>

                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Stable
                      </span>
                    </div>

                    {/* Circular score */}
                    <div className="mt-8 flex justify-center">
                      <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[15px] border-emerald-200">
                        <div className="absolute inset-3 rounded-full border border-white/70" />

                        <div className="text-center">
                          <p className="text-6xl font-semibold tracking-[-0.07em] text-slate-800">
                            28
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            out of 100
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 text-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Low risk
                      </span>

                      <p className="mt-4 text-xs leading-5 text-slate-400">
                        Your current health pattern appears stable based on
                        the information recorded recently.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trend */}
                <div className="rounded-[30px] bg-white p-6 shadow-[0_10px_45px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Risk trend
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        Improving over 7 days
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      <ArrowUpRight size={14} />
                      22%
                    </div>
                  </div>

                  <div className="mt-8 h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskData}>
                        <defs>
                          <linearGradient
                            id="riskGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#10b981"
                              stopOpacity={0.2}
                            />

                            <stop
                              offset="100%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#eef2f1"
                        />

                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                        />

                        <YAxis
                          domain={[0, 50]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            boxShadow:
                              "0 10px 30px rgba(20,50,45,0.08)",
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="risk"
                          stroke="#10b981"
                          strokeWidth={3}
                          fill="url(#riskGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Compared with last week
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Risk score decreased from 36 → 28
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Change</p>
                      <p className="text-sm font-bold text-emerald-600">
                        -8 points
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why score changed */}
              <section className="mt-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
                    Explainable AI
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Why is your score 28?
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    These factors had the biggest influence on your current
                    health-risk score.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                  <FactorCard
                    icon={<Moon size={19} />}
                    title="Sleep"
                    value="7.2 hours"
                    description="Consistent sleep pattern"
                    status="Positive"
                    type="positive"
                  />

                  <FactorCard
                    icon={<Activity size={19} />}
                    title="Activity"
                    value="6,420 steps"
                    description="8% higher than last week"
                    status="Improving"
                    type="positive"
                  />

                  <FactorCard
                    icon={<Pill size={19} />}
                    title="Medication"
                    value="100% adherence"
                    description="All scheduled doses taken"
                    status="On track"
                    type="positive"
                  />

                  <FactorCard
                    icon={<TriangleAlert size={19} />}
                    title="Stress"
                    value="Moderate"
                    description="Slight increase this week"
                    status="Watch"
                    type="warning"
                  />
                </div>
              </section>

              {/* AI recommendation */}
              <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">

                <div className="rounded-[28px] bg-[#f4f9ff] p-6 ring-1 ring-blue-50 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                        SumanCare recommendation
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-800">
                        Keep your current routine consistent.
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Your recent activity and medication adherence are
                        contributing positively to your health pattern. Focus
                        on maintaining consistent sleep and monitoring stress.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Recommendation
                      icon={<Clock3 size={16} />}
                      text="Sleep 7–8 hrs"
                    />

                    <Recommendation
                      icon={<Activity size={16} />}
                      text="Stay active"
                    />

                    <Recommendation
                      icon={<HeartPulse size={16} />}
                      text="Monitor vitals"
                    />
                  </div>
                </div>

                {/* Doctor */}
                <div className="rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(20,50,45,0.04)] ring-1 ring-slate-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Stethoscope size={20} />
                  </div>

                  <h3 className="mt-5 font-semibold">
                    Want professional guidance?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Share your recent health summary with your doctor for
                    professional evaluation.
                  </p>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Prepare doctor summary
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              {/* Important note */}
              <div className="mt-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <TriangleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <p className="text-xs leading-5 text-amber-800">
                  SumanCare provides AI-assisted health insights for
                  monitoring and awareness. It does not diagnose medical
                  conditions or replace professional medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* Factor Card */

function FactorCard({
  icon,
  title,
  value,
  description,
  status,
  type,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  status: string;
  type: "positive" | "warning";
}) {
  const positive = type === "positive";

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(20,50,45,0.035)] ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {icon}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-5 text-xs text-slate-400">{title}</p>

      <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* Recommendation */

function Recommendation({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-medium text-slate-600 shadow-sm">
      <span className="text-blue-500">{icon}</span>
      {text}
    </div>
  );
}