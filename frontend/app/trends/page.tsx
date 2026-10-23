"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Brain,
  ChevronRight,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Pill,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
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
import { useCallback, useEffect, useMemo, useState } from "react";

type Period = "7D" | "30D";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type VitalRecord = {
  id?: number;
  recorded_at?: string | null;
  created_at?: string | null;
  systolic_bp?: number | string | null;
  diastolic_bp?: number | string | null;
  heart_rate?: number | string | null;
  blood_glucose?: number | string | null;
  oxygen_level?: number | string | null;
  oxygen_saturation?: number | string | null;
  weight_kg?: number | string | null;
};

type TrendRecord = {
  day: string;
  timestamp: number;
  systolic?: number;
  diastolic?: number;
  heart?: number;
  glucose?: number;
  oxygen?: number;
  steps?: number;
  sleep?: number;
  water?: number;
};

type LifestyleRecord = {
  sleep_hours?: number | string | null;
  steps?: number | null;
  water_intake_liters?: number | string | null;
  activity_minutes?: number | null;
  medication_status?: string | null;
};

function numericValue(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dcefe8",
  borderRadius: "14px",
  boxShadow: "0 10px 30px rgba(20, 80, 65, 0.08)",
};

export default function HealthTrendsPage() {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [period, setPeriod] = useState<Period>("7D");
  const [activeMetric, setActiveMetric] = useState("blood-pressure");
  const [lifestyle, setLifestyle] = useState<LifestyleRecord | null>(null);

  const data = useMemo(() => {
    const now = new Date();
    const days = period === "7D" ? 7 : 30;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    cutoff.setHours(0, 0, 0, 0);

    return vitals
      .map((record) => {
        const dateValue = record.recorded_at ?? record.created_at;

        if (!dateValue) return null;

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime()) || date < cutoff || date > now) {
          return null;
        }

        const systolic = numericValue(record.systolic_bp);
        const diastolic = numericValue(record.diastolic_bp);
        const heart = numericValue(record.heart_rate);
        const glucose = numericValue(record.blood_glucose);
        const oxygen = numericValue(
          record.oxygen_level ?? record.oxygen_saturation
        );

        return {
          day: date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          timestamp: date.getTime(),
          ...(systolic !== undefined && { systolic }),
          ...(diastolic !== undefined && { diastolic }),
          ...(heart !== undefined && { heart }),
          ...(glucose !== undefined && { glucose }),
          ...(oxygen !== undefined && { oxygen }),
        };
      })
      .filter((record): record is TrendRecord => record !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [vitals, period]);

  const today = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const averageSleep = useMemo(() => {
    return (
      data.reduce((sum, item) => sum + (item.sleep ?? 0), 0) / data.length
    ).toFixed(1);
  }, [data]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const metrics = [
    {
      id: "blood-pressure",
      title: "Blood Pressure",
      value:
        latest?.systolic !== undefined && latest?.diastolic !== undefined
          ? `${latest.systolic}/${latest.diastolic}`
          : "—",
      change: "Latest recorded reading",
      description:
        latest?.systolic !== undefined ? "Latest reading" : "No data",
      icon: HeartPulse,
    },
    {
      id: "heart-rate",
      title: "Heart Rate",
      value: latest?.heart !== undefined ? `${latest.heart} bpm` : "—",
      change: "Latest recorded reading",
      description: latest?.heart !== undefined ? "Latest reading" : "No data",
      icon: Activity,
    },
    {
      id: "glucose",
      title: "Glucose",
      value: latest?.glucose !== undefined ? `${latest.glucose} mg/dL` : "—",
      change: "Latest recorded reading",
      description: latest?.glucose !== undefined ? "Latest reading" : "No data",
      icon: Activity,
    },
    {
      id: "oxygen",
      title: "Oxygen Saturation",
      value: latest?.oxygen !== undefined ? `${latest.oxygen}%` : "—",
      change: "Latest recorded reading",
      description: latest?.oxygen !== undefined ? "Latest reading" : "No data",
      icon: HeartPulse,
    },
    {
      id: "sleep",
      title: "Sleep",
      value:
        lifestyle?.sleep_hours !== null && lifestyle?.sleep_hours !== undefined
          ? `${lifestyle.sleep_hours} hrs`
          : "—",
      change: "Today's recorded value",
      description:
        lifestyle?.sleep_hours !== null && lifestyle?.sleep_hours !== undefined
          ? "Today's record"
          : "No data",
      icon: Moon,
    },
  ];

  const loadVitals = useCallback(async () => {
    const token = sessionStorage.getItem("sumancare_access_token");

    if (!token) {
      setLoadError("Please log in to view your health trends.");
      setVitals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch(`${API_BASE_URL}/vitals/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Unable to load your health readings."
        );
      }

      const records: VitalRecord[] = await response.json();
      setVitals(Array.isArray(records) ? records : []);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your health readings."
      );
      setVitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVitals();
  }, [loadVitals]);

  const loadLifestyle = useCallback(async () => {
    const token = sessionStorage.getItem("sumancare_access_token");

    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/lifestyle/today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load today's lifestyle data.");
      }

      const record: LifestyleRecord | null = await response.json();
      setLifestyle(record);
    } catch (error) {
      console.error("Lifestyle data fetch failed:", error);
      setLifestyle(null);
    }
  }, []);

  useEffect(() => {
    void loadLifestyle();
  }, [loadLifestyle]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e7faf3_0%,_#f7fcfa_35%,_#ffffff_70%)] text-slate-800">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/80 shadow-sm backdrop-blur transition hover:scale-105"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>

          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
              SumanCare
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              Health Trends
            </h1>
          </div>

          <button
            onClick={() => {
              void Promise.all([loadVitals(), loadLifestyle()]);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/80 shadow-sm backdrop-blur transition hover:rotate-45"
          >
            <RefreshCw size={18} className="text-slate-600" />
          </button>
        </header>

        {/* Intro */}
        <section className="mb-7">
          <p className="mb-2 text-sm text-slate-500">{today}</p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Your health, over time.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track your health patterns and understand how your daily
                habits are changing your overall wellness.
              </p>
            </div>

            {/* Period */}
            <div className="flex w-fit rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
              {(["7D", "30D"] as Period[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    period === item
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-emerald-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI Insight */}
        <section className="mb-7 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/60 p-5 shadow-[0_15px_50px_rgba(30,100,80,0.07)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
              <Brain size={27} className="text-emerald-600" />
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={15} className="text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">
                  SumanCare Health Insights
                </p>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {loading
                  ? "Loading your recorded health readings..."
                  : loadError
                    ? "Your health readings could not be loaded. Please check your connection or sign in again."
                    : data.length >= 2
                      ? "You have multiple recorded health readings for this period. Review your chart to compare measurements over time. These records alone do not establish a medical risk assessment."
                      : data.length === 1
                        ? "One health reading is available for this period. More readings over time will help you review changes in your measurements."
                        : "No health readings are available for this period yet. Record your measurements to begin tracking trends."}
              </p>
            </div>

            <Link
              href="/health-risk"
              className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              View Health Risk
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* Metric cards */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const active = activeMetric === metric.id;

            return (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`rounded-[24px] border p-5 text-left transition ${
                  active
                    ? "border-emerald-200 bg-white shadow-[0_15px_40px_rgba(30,100,80,0.08)]"
                    : "border-slate-100 bg-white/70 hover:border-emerald-100 hover:bg-white"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                    <Icon size={20} className="text-emerald-600" />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingDown size={14} />
                    {metric.change}
                  </div>
                </div>

                <p className="text-sm text-slate-500">{metric.title}</p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {metric.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {metric.description}
                </p>
              </button>
            );
          })}
        </section>

        {/* Main chart */}
        <section className="mb-7 rounded-[28px] border border-slate-100 bg-white/90 p-5 shadow-[0_15px_50px_rgba(20,70,60,0.06)] sm:p-7">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-600">
                Health signal
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                {activeMetric === "blood-pressure" && "Blood Pressure Trend"}
                {activeMetric === "heart-rate" && "Heart Rate Trend"}
                {activeMetric === "glucose" && "Glucose Trend"}
                {activeMetric === "oxygen" && "Oxygen Saturation Trend"}
                {activeMetric === "sleep" && "Sleep Trend"}
              </h3>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Activity size={14} />
              {loading
                ? "Loading"
                : loadError
                  ? "Unavailable"
                  : data.length >= 2
                    ? "Recorded readings"
                    : data.length === 1
                      ? "Single reading"
                      : "No data"}
            </div>
          </div>

          <div className="h-[280px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading your health readings...
              </div>
            ) : loadError ? (
              <div className="flex h-full items-center justify-center text-sm text-rose-500">
                {loadError}
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <HeartPulse size={28} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  No readings available for this period
                </p>
                <p className="text-xs text-slate-400">
                  Record your health measurements to see your trends.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#edf5f2"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ stroke: "#a7f3d0" }}
                  />

                  {activeMetric === "blood-pressure" && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="systolic"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#trendFill)"
                        connectNulls={false}
                        name="Systolic (mmHg)"
                        isAnimationActive={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#6ee7b7"
                        strokeWidth={2}
                        fill="transparent"
                        connectNulls={false}
                        name="Diastolic (mmHg)"
                        isAnimationActive={false}
                      />
                    </>
                  )}

                  {activeMetric === "heart-rate" && (
                    <Area
                      type="monotone"
                      dataKey="heart"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#trendFill)"
                      connectNulls={false}
                      name="Heart rate (bpm)"
                      isAnimationActive={false}
                    />
                  )}

                  {activeMetric === "glucose" && (
                    <Area
                      type="monotone"
                      dataKey="glucose"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#trendFill)"
                      connectNulls={false}
                      name="Glucose (mg/dL)"
                      isAnimationActive={false}
                    />
                  )}

                  {activeMetric === "oxygen" && (
                    <Area
                      type="monotone"
                      dataKey="oxygen"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fill="url(#trendFill)"
                      connectNulls={false}
                      name="Oxygen saturation (%)"
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Lifestyle overview */}
        <section className="mb-7">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-600">
              Daily habits
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Lifestyle overview
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Steps */}
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <Footprints size={20} className="text-blue-600" />
                </div>
                <Activity size={17} className="text-slate-400" />
              </div>

              <p className="text-sm text-slate-500">Today's steps</p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {lifestyle?.steps !== null && lifestyle?.steps !== undefined
                  ? Number(lifestyle.steps).toLocaleString()
                  : "—"}
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width:
                      lifestyle?.steps !== null && lifestyle?.steps !== undefined
                        ? `${Math.min(
                            (Number(lifestyle.steps) / 8000) * 100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Reference target: 8,000 steps/day
              </p>
            </div>

            {/* Water */}
           <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
                <Droplets size={20} className="text-cyan-600" />
              </div>
              <Activity size={17} className="text-slate-400" />
            </div>

            <p className="text-sm text-slate-500">Today's water intake</p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {lifestyle?.water_intake_liters !== null &&
              lifestyle?.water_intake_liters !== undefined
                ? `${Number(lifestyle.water_intake_liters).toFixed(1)} L`
                : "—"}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{
                  width:
                    lifestyle?.water_intake_liters !== null &&
                    lifestyle?.water_intake_liters !== undefined
                      ? `${Math.min(
                          (Number(lifestyle.water_intake_liters) / 2.5) * 100,
                          100
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Reference: 2.5 L/day
            </p>
          </div>

            {/* Sleep */}
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50">
                  <Moon size={20} className="text-purple-600" />
                </div>
                <Activity size={17} className="text-slate-400" />
              </div>

              <p className="text-sm text-slate-500">Today's sleep</p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {lifestyle?.sleep_hours !== null &&
                lifestyle?.sleep_hours !== undefined
                  ? `${Number(lifestyle.sleep_hours).toFixed(1)} hrs`
                  : "—"}
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width:
                      lifestyle?.sleep_hours !== null &&
                      lifestyle?.sleep_hours !== undefined
                        ? `${Math.min(
                            (Number(lifestyle.sleep_hours) / 8) * 100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Reference: 8 hours of sleep
              </p>
            </div>
          </div>
        </section>

        {/* Medication */}
        <section className="mb-7 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
                <Pill size={20} className="text-amber-600" />
              </div>
              <Activity size={17} className="text-slate-400" />
            </div>

            <p className="text-sm text-slate-500">Medication status</p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {lifestyle?.medication_status?.trim() || "Not recorded"}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              Based on today's lifestyle record. This does not represent a weekly
              adherence percentage.
            </p>
          </div>
        </section>

        {/* Bottom links */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/health-risk"
            className="group flex items-center justify-between rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-5 transition hover:bg-emerald-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Update today&apos;s health
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Record your latest vitals and lifestyle data.
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-emerald-600 transition group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/health-risk"
            className="group flex items-center justify-between rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm transition hover:bg-emerald-50/40"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Understand your risk
              </p>
              <p className="mt-1 text-xs text-slate-500">
                See what factors are influencing your AI health score.
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-emerald-600 transition group-hover:translate-x-1"
            />
          </Link>
        </section>

        {/* Disclaimer */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-5 text-slate-400">
          SumanCare provides AI-assisted health insights for monitoring and
          awareness. These insights are not a medical diagnosis and should not
          replace professional medical advice.
        </p>

        <div className="h-5" />
      </div>
    </main>
  );
}