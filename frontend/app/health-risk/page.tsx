
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowDownRight,
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
  RefreshCw,
  Droplets,
  Footprints,
  CalendarDays,
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

import { useCallback, useEffect, useState } from "react";

/* ================================================= */
/* API CONFIGURATION */
/* ================================================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ================================================= */
/* TYPES */
/* ================================================= */

type VitalRecord = {
  patient_id?: number;
  recorded_at?: string;
  created_at?: string;
  systolic_bp?: number | string | null;
  diastolic_bp?: number | string | null;
  blood_pressure_systolic?: number | string | null;
  blood_pressure_diastolic?: number | string | null;
  heart_rate?: number | string | null;
  glucose?: number | string | null;
  blood_glucose?: number | string | null;
  glucose_mg_dl?: number | string | null;
  weight?: number | string | null;
  weight_kg?: number | string | null;
  oxygen_saturation?: number | string | null;
  spo2?: number | string | null;
  oxygen_level?: number | string | null;
  notes?: string | null;
  [key: string]: unknown;
};

type LifestyleRecord = {
  sleep_hours?: number | string | null;
  water_intake_liters?: number | string | null;
  steps?: number | null;
  activity_minutes?: number | null;
  stress_level?: string | null;
  meal_quality?: string | null;
  medication_status?: string | null;
};

type ChartRecord = {
  day: string;
  risk: number;
  recordedAt: string;
};

/* ================================================= */
/* HELPERS */
/* ================================================= */

function getNumber(
  record: VitalRecord | null,
  keys: string[]
): number | null {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function formatNumber(
  value: number | null,
  suffix = ""
): string {
  if (value === null) return "Not recorded";

  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function getRecordDate(record: VitalRecord): string | null {
  const value = record.recorded_at ?? record.created_at;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : value;
}

function getRecordTimestamp(record: VitalRecord): number {
  const value = getRecordDate(record);

  return value ? new Date(value).getTime() : 0;
}

/* ================================================= */
/* MAIN PAGE */
/* ================================================= */
type MonitoringSummary = {
  assessment_status: string;
  monitoring_score: number | null;
  monitoring_level: string;
  monitoring_explanation: string;
  contributing_factors: string[];
  readings_analyzed: number;
  disclaimer: string;
};

export default function HealthRiskPage() {
  /* =========================
     RISK ASSESSMENT
  ========================= */

  // No validated risk-assessment model is connected yet.
  const [monitoringSummary, setMonitoringSummary] =
    useState<MonitoringSummary | null>(null);

  const [monitoringLoading, setMonitoringLoading] = useState(true);

  const [monitoringError, setMonitoringError] = useState("");

  const currentRisk = monitoringSummary?.monitoring_score ?? null;

  const riskLevel =
    monitoringSummary?.monitoring_level ??
    (monitoringLoading ? "Loading..." : "Not assessed");

  const previousRisk: number | null = null;
  const riskChange: number | null = null;
  const improvementPercentage: number | null = null;

  useEffect(() => {
    let cancelled = false;

    async function loadMonitoringSummary() {
      setMonitoringLoading(true);
      setMonitoringError("");

      try {
        const token = sessionStorage.getItem("sumancare_access_token");

        if (!token) {
          throw new Error("Please log in to view health monitoring.");
        }

        const response = await fetch(
          `${API_BASE_URL}/health-risk/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : "Unable to load the monitoring summary."
          );
        }

        const data: MonitoringSummary = await response.json();

        if (!cancelled) {
          setMonitoringSummary(data);
        }
      } catch (error) {
        if (!cancelled) {
          setMonitoringError(
            error instanceof Error
              ? error.message
              : "Unable to load the monitoring summary."
          );
          setMonitoringSummary(null);
        }
      } finally {
        if (!cancelled) {
          setMonitoringLoading(false);
        }
      }
    }

    void loadMonitoringSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     API DATA
  ========================= */

  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(true);
  const [vitalsError, setVitalsError] = useState("");
  const [lifestyle, setLifestyle] = useState<LifestyleRecord | null>(null);
  const [lifestyleLoading, setLifestyleLoading] = useState(true);
  const [researchPrediction, setResearchPrediction] = useState<{
    experimental_positive_label_probability: number;
    target: string;
    clinical_status: string;
    disclaimer: string;
  } | null>(null);

  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");


  const loadVitals = useCallback(async () => {
    setVitalsLoading(true);
    setVitalsError("");

    try {
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("sumancare_access_token")
          : null;

      if (!token) {
        setVitals([]);
        setVitalsError("Please log in to view your health readings.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResponse, vitalsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/me`, { headers }),
        fetch(`${API_BASE_URL}/vitals/`, { headers }),
      ]);

      if (profileResponse.status === 401 || vitalsResponse.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!profileResponse.ok || !vitalsResponse.ok) {
        throw new Error("Unable to load your health readings.");
      }

      const profile = await profileResponse.json();
      const responseData = await vitalsResponse.json();

      const patientId = Number(profile.patient_id ?? profile.id);

      if (!Number.isFinite(patientId)) {
        throw new Error("Unable to identify the signed-in patient.");
      }

      const records: VitalRecord[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.records)
          ? responseData.records
          : Array.isArray(responseData.items)
            ? responseData.items
            : [];

      // Keep only the signed-in patient's records.
      const patientRecords = records
        .filter(
          (record) => Number(record.patient_id) === patientId
        )
        .sort(
          (a, b) => getRecordTimestamp(b) - getRecordTimestamp(a)
        );

      setVitals(patientRecords);
    } catch (error) {
      setVitals([]);
      setVitalsError(
        error instanceof Error
          ? error.message
          : "Unable to load your health readings."
      );
    } finally {
      setVitalsLoading(false);
    }
  }, []);

  const loadLifestyle = useCallback(async () => {
    setLifestyleLoading(true);

    try {
      const token = sessionStorage.getItem("sumancare_access_token");

      if (!token) {
        setLifestyle(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/lifestyle/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load lifestyle data.");
      }

      const data: LifestyleRecord | null = await response.json();
      setLifestyle(data);
    } catch (error) {
      console.error("Lifestyle data could not be loaded:", error);
      setLifestyle(null);
    } finally {
      setLifestyleLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVitals();
    void loadLifestyle();
  }, [loadVitals, loadLifestyle]);

  const latestVital = vitals[0] ?? null;


  const getSystolic = (record: VitalRecord | null) =>
    getNumber(record, ["systolic_bp", "blood_pressure_systolic"]);

  const getDiastolic = (record: VitalRecord | null) =>
    getNumber(record, ["diastolic_bp", "blood_pressure_diastolic"]);

  const getHeartRate = (record: VitalRecord | null) =>
    getNumber(record, ["heart_rate", "pulse"]);

  const getGlucose = (record: VitalRecord | null) =>
    getNumber(record, [
      "glucose",
      "blood_glucose",
      "glucose_mg_dl",
      "blood_sugar",
    ]);

  const getWeight = (record: VitalRecord | null) =>
    getNumber(record, ["weight_kg", "weight"]);

  const getOxygen = (record: VitalRecord | null) =>
    getNumber(record, ["oxygen_saturation", "spo2", "oxygen_level"]);

  // Data availability only — this is NOT a health score.

  // Data availability only — this is NOT a health score.
  const vitalFields = [
    getSystolic(latestVital) !== null &&
      getDiastolic(latestVital) !== null,
    getHeartRate(latestVital) !== null,
    getGlucose(latestVital) !== null,
    getWeight(latestVital) !== null,
    getOxygen(latestVital) !== null,
  ];

  const availableVitalCount = vitalFields.filter(Boolean).length;
  const totalVitalFields = vitalFields.length;

  const lifestyleFields = [
    lifestyle?.sleep_hours,
    lifestyle?.steps,
    lifestyle?.water_intake_liters,
    lifestyle?.activity_minutes,
    lifestyle?.stress_level,
    lifestyle?.meal_quality,
    lifestyle?.medication_status,
  ];

  const availableLifestyleCount = lifestyleFields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  ).length;

  const totalLifestyleFields = lifestyleFields.length;

  const vitalCompleteness = Math.round(
    (availableVitalCount / totalVitalFields) * 100
  );

  const lifestyleCompleteness = Math.round(
    (availableLifestyleCount / totalLifestyleFields) * 100
  );

  const dataCompletenessLoading = vitalsLoading || lifestyleLoading;


  const chartData: ChartRecord[] = [...vitals]
    .filter((record) => getSystolic(record) !== null)
    .reverse()
    .map((record) => {
      const dateValue = getRecordDate(record);
      const date = dateValue ? new Date(dateValue) : null;

      return {
        day: date
          ? date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })
          : "Recorded",
        risk: getSystolic(record) as number,
        recordedAt: dateValue ?? "",
      };
    });

  /* =========================
     DATE
  ========================= */

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const formatted = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date());

      setCurrentDate(formatted);
    };

    updateDate();

    const timer = setInterval(updateDate, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     REFRESH READINGS
  ========================= */

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    setAnalysisComplete(false);

    try {
      await Promise.all([loadVitals(), loadLifestyle()]);
      setAnalysisComplete(true);

      setTimeout(() => {
        setAnalysisComplete(false);
      }, 3500);
    } finally {
      setAnalyzing(false);
    }
  };

  /* =========================
     DOCTOR SUMMARY
  ========================= */

  const [summaryPrepared, setSummaryPrepared] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const handleDoctorSummary = async () => {
    setSummaryError("");

    if (!latestVital) {
      setSummaryError("No recorded readings are available to include.");
      return;
    }

    const dateValue = getRecordDate(latestVital);
    const recordedDate = dateValue
      ? new Date(dateValue).toLocaleString()
      : "Date unavailable";

    const summary = [
      "SumanCare — Health Readings Summary",
      `Generated: ${new Date().toLocaleString()}`,
      `Latest recorded reading: ${recordedDate}`,
      `Blood pressure: ${
        getSystolic(latestVital) ?? "Not recorded"
      } / ${getDiastolic(latestVital) ?? "Not recorded"} mmHg`,
      `Heart rate: ${formatNumber(getHeartRate(latestVital), " BPM")}`,
      `Blood glucose: ${formatNumber(getGlucose(latestVital), " mg/dL")}`,
      `Weight: ${formatNumber(getWeight(latestVital), " kg")}`,
      `Oxygen saturation: ${formatNumber(getOxygen(latestVital), "%")}`,
      "",
      "This summary contains recorded values only. It is not a diagnosis or an AI-generated risk assessment.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setSummaryPrepared(true);

      setTimeout(() => {
        setSummaryPrepared(false);
      }, 3500);
    } catch {
      setSummaryError(
        "Clipboard access is unavailable. Please check your browser permissions."
      );
    }
  };

  const latestRecordDate = latestVital
    ? getRecordDate(latestVital)
    : null;

  const latestRecordLabel = latestRecordDate
    ? new Date(latestRecordDate).toLocaleString()
    : "No readings yet";

  return (
    <main className="min-h-screen bg-[#f4fafa] text-[#14201d]">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-white/70 blur-3xl" />

      </div>

      {/* ================================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================================= */}

      <div className="relative mx-auto min-h-screen max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">

        <div className="min-h-[calc(100vh-32px)] overflow-hidden rounded-[32px] border border-white bg-white/75 shadow-[0_20px_80px_rgba(24,67,60,0.08)] backdrop-blur-xl">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-x-0.5 hover:shadow-md"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  SumanCare AI
                </p>

                <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                  Health Intelligence
                </h1>

              </div>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Brain size={20} />
            </div>

          </header>

          {/* ================================================= */}
          {/* PAGE CONTENT */}
          {/* ================================================= */}

          <div className="px-5 py-7 sm:px-8 lg:px-12">

            <div className="mx-auto max-w-6xl">

              {/* ================================================= */}
              {/* INTRO */}
              {/* ================================================= */}

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

                <div className="max-w-2xl">

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Sparkles size={13} />
                    AI-assisted health analysis
                  </div>

                  <h2 className="text-3xl font-medium tracking-tight text-slate-800 sm:text-4xl">
                    Understand what your health data is telling you.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    Review your recorded health readings and identify
                    information you may wish to discuss with a healthcare
                    professional.
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {currentDate || "Updating date..."}
                  </p>

                </div>

                {/* Refresh readings */}

                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={analyzing || vitalsLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
                >

                  <RefreshCw
                    size={16}
                    className={analyzing ? "animate-spin" : ""}
                  />

                  {analyzing ? "Refreshing..." : "Refresh readings"}

                </button>

              </div>

              {/* ================================================= */}
              {/* DATA COMPLETENESS */}
              {/* ================================================= */}

              <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Health data completeness
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Track which health information has been recorded.
                    </p>
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Data availability only
                  </span>
                </div>

                {dataCompletenessLoading ? (
                  <p className="mt-5 text-sm text-slate-500">
                    Loading your recorded health data...
                  </p>
                ) : (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-700">
                          Vital measurements
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {availableVitalCount}/{totalVitalFields}
                        </span>
                      </div>

                      <div
                        className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Vital measurements recorded"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={vitalCompleteness}
                      >
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${vitalCompleteness}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {vitalCompleteness}% recorded
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-700">
                          Lifestyle information
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {availableLifestyleCount}/{totalLifestyleFields}
                        </span>
                      </div>

                      <div
                        className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Lifestyle information recorded"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={lifestyleCompleteness}
                      >
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${lifestyleCompleteness}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {lifestyleCompleteness}% recorded
                      </p>
                    </div>
                  </div>
                )}

                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  These percentages describe recorded information, not your
                  health status or disease risk. Missing readings do not
                  necessarily indicate a health problem.
                </p>
              </section>

              {/* ================================================= */}
              {/* MISSING DATA GUIDANCE */}
              {/* ================================================= */}

              {!dataCompletenessLoading && (
                <section className="mt-5 rounded-3xl border border-amber-100 bg-amber-50/60 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600">
                      <Sparkles size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-800">
                        Complete your health records
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        The following information has not been recorded in
                        the latest available entries.
                      </p>

                      {(() => {
                        const missingVitals = [
                          {
                            label: "Blood pressure",
                            missing:
                              getSystolic(latestVital) === null ||
                              getDiastolic(latestVital) === null,
                          },
                          {
                            label: "Heart rate",
                            missing: getHeartRate(latestVital) === null,
                          },
                          {
                            label: "Blood glucose",
                            missing: getGlucose(latestVital) === null,
                          },
                          {
                            label: "Weight",
                            missing: getWeight(latestVital) === null,
                          },
                          {
                            label: "Oxygen saturation",
                            missing: getOxygen(latestVital) === null,
                          },
                        ].filter((field) => field.missing);

                        const missingLifestyle = [
                          {
                            label: "Sleep",
                            missing:
                              lifestyle?.sleep_hours == null ||
                              lifestyle.sleep_hours === "",
                          },
                          {
                            label: "Steps",
                            missing: lifestyle?.steps == null,
                          },
                          {
                            label: "Water intake",
                            missing:
                              lifestyle?.water_intake_liters == null ||
                              lifestyle.water_intake_liters === "",
                          },
                          {
                            label: "Physical activity",
                            missing: lifestyle?.activity_minutes == null,
                          },
                          {
                            label: "Stress level",
                            missing: !lifestyle?.stress_level,
                          },
                          {
                            label: "Meal quality",
                            missing: !lifestyle?.meal_quality,
                          },
                          {
                            label: "Medication status",
                            missing: !lifestyle?.medication_status,
                          },
                        ].filter((field) => field.missing);

                        return (
                          <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Vital measurements
                              </p>

                              {missingVitals.length === 0 ? (
                                <p className="mt-2 text-sm text-emerald-700">
                                  All listed measurements are recorded.
                                </p>
                              ) : (
                                <ul className="mt-3 space-y-2">
                                  {missingVitals.map((field) => (
                                    <li
                                      key={field.label}
                                      className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                      {field.label}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Lifestyle information
                              </p>

                              {missingLifestyle.length === 0 ? (
                                <p className="mt-2 text-sm text-emerald-700">
                                  All listed lifestyle fields are recorded.
                                </p>
                              ) : (
                                <ul className="mt-3 space-y-2">
                                  {missingLifestyle.map((field) => (
                                    <li
                                      key={field.label}
                                      className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                      {field.label}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <p className="mt-5 text-xs leading-5 text-slate-500">
                        Missing records do not necessarily indicate a health
                        problem. Record measurements when appropriate and
                        follow your healthcare professional's advice.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ================================================= */}
              {/* DATA STATUS */}
              {/* ================================================= */}

              {analysisComplete && !vitalsError && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-emerald-700">
                      Readings refreshed
                    </p>

                    <p className="text-xs text-emerald-600/70">
                      {vitals.length} recorded reading(s) available.
                    </p>

                  </div>

                </div>
              )}

              {vitalsError && (
                <div
                  role="alert"
                  className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4"
                >
                  <TriangleAlert size={18} className="shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">{vitalsError}</p>
                </div>
              )}

              {/* ================================================= */}
              {/* MAIN RISK SECTION */}
              {/* ================================================= */}

              <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">

                {/* ================================================= */}
                {/* RISK SCORE */}
                {/* ================================================= */}

                <div className="relative overflow-hidden rounded-[30px] bg-[#eaf8f3] p-7">

                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

                  <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />

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
                        {riskLevel}
                      </span>

                    </div>

                    {/* CIRCULAR SCORE */}

                    <div className="mt-8 flex items-center gap-5">
                      <div
                        className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background:
                            currentRisk === null
                              ? "#e2e8f0"
                              : `conic-gradient(
                                  #10b981 ${currentRisk * 3.6}deg,
                                  #ccefe2 ${currentRisk * 3.6}deg
                                )`,
                        }}
                      >
                        <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#eaf8f3]">
                          <div className="text-center">
                            <p className="text-5xl font-semibold tracking-tight text-slate-800">
                              {currentRisk ?? "—"}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {currentRisk === null ? "Not available" : "/ 100"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-lg font-semibold leading-snug text-slate-800">
                          {riskLevel}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Latest analysis
                        </p>
                      </div>
                    </div>

                    {/* RISK STATUS */}

                    <div className="mt-7 text-center">

                      <span className={`inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm ${
                              currentRisk === null ? "text-slate-600" : "text-emerald-700"
                            }`}
                          >

                        <span
                          className={`h-2 w-2 rounded-full ${
                            currentRisk === null ? "bg-slate-400" : "bg-emerald-500"
                          }`}
                        />

                        {riskLevel}

                      </span>

                      <p className="mt-4 text-xs leading-5 text-slate-400">
                        {monitoringSummary?.monitoring_explanation ??
                          monitoringError ??
                          "Monitoring information is not available yet."}
                      </p>
                      {monitoringSummary && (
                        <div className="mt-4 space-y-3 text-left">
                          <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Readings analyzed
                            </p>

                            <p className="mt-1 text-lg font-semibold text-slate-800">
                              {monitoringSummary.readings_analyzed}
                            </p>
                          </div>

                          {monitoringSummary.contributing_factors.length > 0 ? (
                            <div className="rounded-2xl bg-white/70 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Monitoring observations
                              </p>

                              <ul className="mt-3 space-y-2">
                                {monitoringSummary.contributing_factors.map(
                                  (factor, index) => (
                                    <li
                                      key={`${index}-${factor}`}
                                      className="flex gap-2 text-sm leading-5 text-slate-600"
                                    >
                                      <span className="text-emerald-600">•</span>
                                      <span>{factor}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-xs leading-5 text-slate-500">
                              No monitoring observations are available yet.
                            </p>
                          )}

                          <p className="text-xs leading-5 text-amber-700">
                            {monitoringSummary.disclaimer}
                          </p>
                        </div>
                      )}

                    </div>

                    {/* SCORE FOOTER */}

                    <div className="mt-7 flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Latest reading
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {latestRecordLabel}
                        </p>

                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 size={14} />
                        {vitalsLoading ? "Loading" : "Readings status"}
                      </div>

                    </div>

                  </div>

                </div>

                {/* AI / ML RESEARCH PREDICTION */}

                <section className="mt-6 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Brain size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                        Experimental AI / ML
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-800">
                        Research prediction
                      </h3>
                    </div>
                  </div>

                  {researchPrediction && (
                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                      <p className="text-sm font-semibold text-slate-800">
                        Model output
                      </p>

                      <p className="mt-2 text-3xl font-semibold text-emerald-700">
                        {(
                          researchPrediction.experimental_positive_label_probability * 100
                        ).toFixed(2)}%
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Target: {researchPrediction.target}
                      </p>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {researchPrediction.disclaimer}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        Research prototype only — not a clinical risk score or diagnosis.
                      </p>
                    </div>
                  )}
                </section>

                {/* ================================================= */}
                {/* TREND */}
                {/* ================================================= */}

                <div className="rounded-[30px] bg-white p-6 shadow-[0_10px_45px_rgba(20,50,45,0.045)] ring-1 ring-slate-100 sm:p-7">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Blood pressure trend
                      </p>

                      <h3 className="mt-1 text-xl font-semibold text-slate-800">
                        Your recorded readings
                      </h3>

                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">

                      <ArrowDownRight size={14} />

                      {chartData.length} readings

                    </div>

                  </div>

                  {/* Original AreaChart design */}

                  <div className="mt-8 h-[260px] w-full">

                    {chartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        {vitalsLoading
                          ? "Loading your readings..."
                          : "No blood pressure readings available yet."}
                      </div>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <AreaChart data={chartData}>

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
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 11,
                            }}
                          />

                          <YAxis
                            domain={["auto", "auto"]}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 11,
                            }}
                          />

                          <Tooltip
                            labelFormatter={(_, payload) => {
                              const point = payload?.[0]?.payload as
                                | ChartRecord
                                | undefined;

                              return point?.recordedAt
                                ? new Date(point.recordedAt).toLocaleString()
                                : "";
                            }}
                            contentStyle={{
                              borderRadius: "14px",
                              border: "1px solid #e2e8f0",
                              boxShadow:
                                "0 10px 30px rgba(20,50,45,0.08)",
                            }}
                            formatter={(value) => [
                              `${value} mmHg`,
                              "Systolic BP",
                            ]}
                          />

                          <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#riskGradient)"
                            dot={{
                              r: 3,
                              fill: "#10b981",
                            }}
                            activeDot={{
                              r: 6,
                            }}
                          />

                        </AreaChart>

                      </ResponsiveContainer>
                    )}

                  </div>

                  {/* Trend summary */}

                  <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-xs text-slate-400">
                        Latest recorded blood pressure
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {latestVital &&
                        getSystolic(latestVital) !== null &&
                        getDiastolic(latestVital) !== null
                          ? `${getSystolic(latestVital)} / ${getDiastolic(latestVital)} mmHg`
                          : "Not recorded"}
                      </p>

                    </div>

                    <div className="text-left sm:text-right">

                      <p className="text-xs text-slate-400">
                        Measurements
                      </p>

                      <p className="text-sm font-bold text-emerald-600">
                        {chartData.length}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* QUICK HEALTH SIGNALS */}
              {/* ================================================= */}

              <section className="mt-6">

                <div className="mb-4">

                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Health signals
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-slate-800">
                    What SumanCare is monitoring
                  </h3>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <SignalCard
                    icon={<HeartPulse size={18} />}
                    title="Blood pressure"
                    value={
                      latestVital &&
                      getSystolic(latestVital) !== null &&
                      getDiastolic(latestVital) !== null
                        ? `${getSystolic(latestVital)} / ${getDiastolic(latestVital)}`
                        : "Not recorded"
                    }
                    subtitle={
                      latestVital
                        ? "Latest recorded reading (mmHg)"
                        : "No reading available"
                    }
                  />

                  <SignalCard
                    icon={<Activity size={18} />}
                    title="Heart rate"
                    value={formatNumber(getHeartRate(latestVital), " BPM")}
                    subtitle="Latest recorded reading"
                  />

                  <SignalCard
                    icon={<Droplets size={18} />}
                    title="Blood glucose"
                    value={formatNumber(getGlucose(latestVital), " mg/dL")}
                    subtitle="Latest recorded reading"
                  />

                  <SignalCard
                    icon={<Footprints size={18} />}
                    title="Weight"
                    value={formatNumber(getWeight(latestVital), " kg")}
                    subtitle="Latest recorded reading"
                  />

                </div>

              </section>

              {/* ================================================= */}
              {/* EXPLAINABLE AI */}
              {/* ================================================= */}

              <section className="mt-7">

                <div className="mb-4">

                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
                    Explainable AI
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-slate-800">
                    Health factors
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Lifestyle tracking and validated risk-factor analysis
                    are not connected to this page yet.
                  </p>

                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                  <FactorCard
                    icon={<Moon size={19} />}
                    title="Sleep"
                    value={
                      lifestyleLoading
                        ? "Loading..."
                        : lifestyle?.sleep_hours != null
                          ? `${lifestyle.sleep_hours} hours`
                          : "Not recorded"
                    }
                    description="Last night's recorded sleep duration."
                    status={
                      lifestyleLoading
                        ? "Loading"
                        : lifestyle?.sleep_hours != null
                          ? "Recorded"
                          : "Unavailable"
                    }
                    type={
                      !lifestyleLoading && lifestyle?.sleep_hours != null
                        ? "positive"
                        : "warning"
                    }
                  />

                  <FactorCard
                    icon={<Activity size={19} />}
                    title="Activity"
                    value={
                      lifestyleLoading
                        ? "Loading..."
                        : lifestyle?.steps != null
                          ? `${Number(lifestyle.steps).toLocaleString("en-IN")} steps`
                          : "Not recorded"
                    }
                    description={
                      lifestyle?.activity_minutes != null
                        ? `${lifestyle.activity_minutes} minutes of exercise recorded.`
                        : "Daily step count and exercise duration."
                    }
                    status={
                      lifestyleLoading
                        ? "Loading"
                        : lifestyle?.steps != null ||
                            lifestyle?.activity_minutes != null
                          ? "Recorded"
                          : "Unavailable"
                    }
                    type={
                      !lifestyleLoading &&
                      (lifestyle?.steps != null ||
                        lifestyle?.activity_minutes != null)
                        ? "positive"
                        : "warning"
                    }
                  />

                  <FactorCard
                    icon={<Pill size={19} />}
                    title="Medication"
                    value={
                      lifestyleLoading
                        ? "Loading..."
                        : lifestyle?.medication_status ?? "Not recorded"
                    }
                    description="Self-reported medication status for today."
                    status={
                      lifestyleLoading
                        ? "Loading"
                        : lifestyle?.medication_status != null
                          ? "Recorded"
                          : "Unavailable"
                    }
                    type={
                      !lifestyleLoading && lifestyle?.medication_status != null
                        ? "positive"
                        : "warning"
                    }
                  />

                  <FactorCard
                    icon={<TriangleAlert size={19} />}
                    title="Stress"
                    value={
                      lifestyleLoading
                        ? "Loading..."
                        : lifestyle?.stress_level ?? "Not recorded"
                    }
                    description="Your self-reported stress level, not a clinical assessment."
                    status={
                      lifestyleLoading
                        ? "Loading"
                        : lifestyle?.stress_level != null
                          ? "Recorded"
                          : "Unavailable"
                    }
                    type={
                      !lifestyleLoading && lifestyle?.stress_level != null
                        ? "positive"
                        : "warning"
                    }
                  />

                </div>

              </section>

              {/* ================================================= */}
              {/* HEALTH RECOMMENDATION */}
              {/* ================================================= */}

              <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">

                <div className="rounded-[28px] bg-[#f4f9ff] p-6 ring-1 ring-blue-50 sm:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                      <Sparkles size={20} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                        General health guidance
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-800">
                        Keep your health records up to date.
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Record measurements accurately, follow the advice
                        of your healthcare professional, and discuss
                        concerning or changing readings with them.
                        This page has not generated a personalized AI
                        recommendation.
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">

                    <Recommendation
                      icon={<Clock3 size={16} />}
                      text="Maintain sleep routine"
                    />

                    <Recommendation
                      icon={<Activity size={16} />}
                      text="Stay active as advised"
                    />

                    <Recommendation
                      icon={<HeartPulse size={16} />}
                      text="Record your vitals"
                    />

                  </div>

                </div>

                {/* DOCTOR SUMMARY */}

                <div className="rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(20,50,45,0.04)] ring-1 ring-slate-100">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Stethoscope size={20} />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-800">
                    Want professional guidance?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Copy your latest recorded readings to share with your
                    doctor. This summary is not a medical assessment.
                  </p>

                  <button
                    type="button"
                    onClick={handleDoctorSummary}
                    disabled={!latestVital}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {summaryPrepared ? (
                      <>
                        <CheckCircle2 size={16} />
                        Summary Copied
                      </>
                    ) : (
                      <>
                        Prepare doctor summary
                        <ChevronRight size={16} />
                      </>
                    )}

                  </button>

                  {summaryError && (
                    <p role="alert" className="mt-3 text-xs text-amber-700">
                      {summaryError}
                    </p>
                  )}

                </div>

              </section>

              {/* ================================================= */}
              {/* QUICK ACTIONS */}
              {/* ================================================= */}

              <section className="mt-6 grid gap-4 sm:grid-cols-2">

                <Link
                  href="/health"
                  className="group flex items-center justify-between rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(20,50,45,0.035)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <HeartPulse size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-700">
                        Update today&apos;s health
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Add your latest readings
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500"
                  />

                </Link>

                <Link
                  href="/trends"
                  className="group flex items-center justify-between rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(20,50,45,0.035)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <CalendarDays size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-700">
                        View health trends
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Explore your longer-term patterns
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                  />

                </Link>

              </section>

              {/* ================================================= */}
              {/* IMPORTANT NOTE */}
              {/* ================================================= */}

              <div className="mt-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">

                <TriangleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <p className="text-xs leading-5 text-amber-800">
                  SumanCare provides health-record monitoring for awareness.
                  This page does not currently calculate a validated AI
                  risk score or diagnose medical conditions. It does not
                  replace professional medical advice.
                </p>

              </div>

              {/* FOOTER */}

              <div className="pb-4 pt-7 text-center">

                <p className="text-[10px] text-slate-300">
                  SumanCare AI • Health Intelligence
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

/* ================================================= */
/* SIGNAL CARD */
/* ================================================= */

function SignalCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_30px_rgba(20,50,45,0.035)] ring-1 ring-slate-100">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-emerald-600">
          {icon}
        </div>

        <div>

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {value}
          </p>

        </div>

      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}

/* ================================================= */
/* FACTOR CARD */
/* ================================================= */

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
    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(20,50,45,0.035)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">

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

      <p className="mt-5 text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-800">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* ================================================= */
/* RECOMMENDATION */
/* ================================================= */

function Recommendation({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-medium text-slate-600 shadow-sm">

      <span className="text-blue-500">
        {icon}
      </span>

      {text}

    </div>
  );
}
