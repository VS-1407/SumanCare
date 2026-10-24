"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Phone,
  MapPin,
  UserRound,
  HeartPulse,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  Share2,
  LoaderCircle,
  LocateFixed,
  XCircle,
  RefreshCw,
  Navigation,
  Clock3,
  Hospital,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TrackingData = {
  emergency_id: number;
  tracking_mode: string;
  status: string;
  message: string;
  latitude: number;
  longitude: number;
  patient_latitude: number;
  patient_longitude: number;
  distance_to_patient_m: number;
  progress_percent: number;
  last_updated: number;
};

const AmbulanceTrackingMap = dynamic(
  () => import("./AmbulanceTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
        Loading demo map...
      </div>
    ),
  },
);

type EmergencyStatus =
  | "requested"
  | "accepted"
  | "dispatched"
  | "completed"
  | "cancelled";

type EmergencyCase = {
  emergency_id: number;
  latitude: number | null;
  longitude: number | null;
  location_accuracy_m: number | null;
  emergency_type: string;
  description: string | null;
  status: EmergencyStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  destination_name?: string | null;
  destination_address?: string | null;
  destination_latitude?: number | null;
  destination_longitude?: number | null;
  destination_distance_m?: number | null;
  destination_source?: string | null;
};
type SOSResponse = {
  message: string;
  emergency_id: number;
  status: string;
  family_emails_submitted: number;
  email_failures: number;
};

type PatientProfile = {
  full_name?: string;
  name?: string;
  blood_group?: string | null;
  phone?: string | null;
  allergies?: string | null;
};

type GPSLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sumancare_access_token");
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in first to use emergency assistance.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your login session may have expired. Please log in again.",
      );
    }

    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : `Request failed (${response.status}).`,
    );
  }

  return data as T;
}

function getCurrentLocation(): Promise<GPSLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser does not support GPS location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Allow location access in browser settings."
            : error.code === error.TIMEOUT
              ? "GPS request timed out. Please try again."
              : "Unable to get your location. You can continue without GPS.";

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-emerald-600">{icon}</div>
      <h2 className="text-sm font-bold">{title}</h2>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-[11px]">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-bold">{value}</p>
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
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="max-w-[60%] break-words text-right text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function formatDistance(distanceM: number | null | undefined): string {
  if (distanceM == null || !Number.isFinite(distanceM)) {
    return "Distance unavailable";
  }

  return distanceM >= 1000
    ? `${(distanceM / 1000).toFixed(1)} km away`
    : `${Math.round(distanceM)} m away`;
}

function statusStyles(status: EmergencyStatus): string {
  switch (status) {
    case "requested":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "accepted":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "dispatched":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function mapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function HospitalDestination({
  item,
}: {
  item: EmergencyCase;
}) {
  const hasDestination =
    item.destination_name != null &&
    item.destination_latitude != null &&
    item.destination_longitude != null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Hospital size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Nearby hospital</p>

          {hasDestination ? (
            <>
              <p className="mt-2 break-words text-sm font-semibold">
                {item.destination_name}
              </p>

              {item.destination_address && (
                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                  {item.destination_address}
                </p>
              )}

              <p className="mt-2 text-xs text-emerald-700">
                {formatDistance(item.destination_distance_m)}
              </p>

              <a
                href={mapUrl(
                  item.destination_latitude!,
                  item.destination_longitude!,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Navigation size={14} />
                View on map
                <ExternalLink size={12} />
              </a>
            </>
          ) : (
            <p className="mt-2 text-xs leading-5 text-amber-700">
              No hospital destination was returned for this request. The lookup
              service may be unavailable or may not have found a result.
            </p>
          )}

          {item.destination_source && (
            <p className="mt-2 break-words text-[11px] text-slate-400">
              Source: {item.destination_source}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
        A map listing does not confirm that a hospital is open, has emergency
        capacity, or has been notified. No ambulance dispatch is integrated.
      </p>
    </div>
  );
}

export default function EmergencyPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [location, setLocation] = useState<GPSLocation | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [startingTrackingId, setStartingTrackingId] = useState<number | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [confirmation, setConfirmation] = useState<
    | { type: "sos" }
    | { type: "cancel"; emergencyId: number }
    | null
  >(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCases = useCallback(async () => {
    setLoadingCases(true);

    try {
      const data = await apiRequest<EmergencyCase[]>("/emergencies");
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load emergencies.",
      );
    } finally {
      setLoadingCases(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await apiRequest<PatientProfile>("/profile/me");

        if (active) setProfile(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load profile.",
          );
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    void loadProfile();
    void loadCases();

    return () => {
      active = false;
    };
  }, [loadCases]);

  useEffect(() => {
    if (trackingId === null) return;

    let active = true;

    const refreshTracking = async () => {
      try {
        const data = await apiRequest<TrackingData>(
          `/emergencies/${trackingId}/tracking`,
        );
        if (active) {
          setTracking(data);
          setTrackingError("");
        }
      } catch (err) {
        if (active) {
          setTrackingError(
            err instanceof Error ? err.message : "Unable to refresh demo tracking.",
          );
        }
      }
    };

    void refreshTracking();
    const intervalId = window.setInterval(() => void refreshTracking(), 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [trackingId]);

  async function handleStartTracking(emergencyId: number) {
    setError("");
    setNotice("");
    setTrackingError("");
    setStartingTrackingId(emergencyId);

    try {
      await apiRequest<unknown>(
        `/emergencies/${emergencyId}/tracking/demo/start`,
        { method: "POST" },
      );

      const data = await apiRequest<TrackingData>(
        `/emergencies/${emergencyId}/tracking`,
      );
      setTracking(data);
      setTrackingId(emergencyId);
      setNotice(`Demo tracking opened for emergency #${emergencyId}.`);
    } catch (err) {
      setTrackingError(
        err instanceof Error ? err.message : "Unable to start demo tracking.",
      );
    } finally {
      setStartingTrackingId(null);
    }
  }

  function stopViewingTracking() {
    setTrackingId(null);
    setTracking(null);
    setTrackingError("");
  }

  async function handleLocate() {
    setError("");
    setNotice("");

    if (!window.isSecureContext) {
      setError(
        "Location requires HTTPS or localhost. Open the app using http://localhost:3000.",
      );
      return;
    }

    setLocating(true);

    try {
      const coords = await getCurrentLocation();
      setLocation(coords);

      setNotice(
        `GPS acquired with approximately ${Math.round(coords.accuracy)} m accuracy.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not acquire GPS location.",
      );
    } finally {
      setLocating(false);
    }
  }

  
  async function handleSOS() {
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      let coords = location;

      if (!coords) {
        try {
          coords = await getCurrentLocation();
          setLocation(coords);
        } catch {
          coords = null;
        }
      }

      const created = await apiRequest<SOSResponse>("/emergencies/sos", {
        method: "POST",
        body: JSON.stringify({
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          emergency_type: "medical",
          description:
            "Emergency assistance requested from SumanCare dashboard.",
        }),
      });

      setNotice(
        `Emergency #${created.emergency_id} recorded. ` +
          `${created.family_emails_submitted} family email alert(s) submitted. ` +
          (created.email_failures > 0
            ? `${created.email_failures} email request(s) failed. `
            : "") +
          (coords
            ? `GPS accuracy: approximately ${Math.round(coords.accuracy)} m.`
            : "Location unavailable; SOS submitted without GPS."),
      );

      await loadCases();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit SOS request.",
      );
    } finally {
      setSubmitting(false);
    }
  }


  async function handleCancel(emergencyId: number) {
    setError("");
    setNotice("");

    setCancellingId(emergencyId);

    try {
      const updated = await apiRequest<EmergencyCase>(
        `/emergencies/${emergencyId}/cancel`,
        { method: "POST" },
      );

      setCases((current) =>
        current.map((item) =>
          item.emergency_id === emergencyId ? updated : item,
        ),
      );

      if (trackingId === emergencyId) {
        setTrackingId(null);
        setTracking(null);
      }

      setNotice(`Emergency request #${emergencyId} is now cancelled.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel request.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleShare() {
    const name = profile?.full_name || profile?.name || "Patient";

    const text = [
      "SumanCare Emergency Health Card",
      `Patient: ${name}`,
      `Blood group: ${profile?.blood_group || "Not available"}`,
      `Phone: ${profile?.phone || "Not available"}`,
      `Allergies: ${profile?.allergies || "Not available"}`,
      location
        ? `GPS: ${location.latitude}, ${location.longitude} (accuracy about ${Math.round(location.accuracy)} m)`
        : "GPS: Not acquired",
      "For an actual emergency in India, call 112.",
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SumanCare Emergency Card",
          text,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setNotice("Emergency card details copied to clipboard.");
      } else {
        setNotice("Sharing is unavailable in this browser.");
      }
    } catch {
      // The user may close the native share dialog.
    }
  }

  const patientName =
    profile?.full_name || profile?.name || "Patient profile unavailable";

  return (
    <main className="min-h-screen bg-[#f7fbfb] px-4 py-5 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold">Emergency Health Card</h1>
            <p className="text-xs text-slate-400">
              Important information at a glance
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label="Share emergency card"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100"
          >
            <Share2 size={17} />
          </button>
        </header>

        <section className="mb-5 rounded-[28px] bg-red-50 p-5 ring-1 ring-red-100">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldAlert size={21} />
            </div>

            <div>
              <p className="font-bold text-red-700">Emergency Information</p>
              <p className="mt-1 text-xs leading-5 text-red-600/80">
                Show your health information to medical personnel. Call 112
                in India for a real emergency.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="mt-2 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <UserRound size={28} />
            </div>

            <div className="min-w-0">
              <p className="break-words text-xl font-bold">{patientName}</p>
              <p className="mt-1 text-xs text-slate-400">
                {loadingProfile
                  ? "Loading patient profile..."
                  : "Patient Health Profile"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoBox
              icon={<Droplets size={17} />}
              label="Blood Group"
              value={profile?.blood_group || "Not recorded"}
            />

            <InfoBox
              icon={<Phone size={17} />}
              label="Phone"
              value={profile?.phone || "Not recorded"}
            />
          </div>
        </section>

        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<AlertTriangle size={18} />}
            title="Critical Information"
          />

          <div className="mt-5 space-y-3">
            <InfoRow
              label="Allergies"
              value={profile?.allergies || "Not recorded"}
            />

            <InfoRow
              label="Known Conditions"
              value="See your saved medical conditions in the health profile."
            />

            <InfoRow
              label="Current Medication"
              value="Medication details are not loaded by this page yet."
            />

            <InfoRow
              label="Heart Rate / HbA1c"
              value="Latest readings are not loaded by this page yet."
            />
          </div>
        </section>

        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<Phone size={18} />}
            title="Emergency Contact"
          />

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Emergency services — India</p>
              <p className="mt-1 text-xs text-slate-400">
                For immediate real-world assistance
              </p>
            </div>

            <a
              href="tel:112"
              className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Phone size={14} />
              Call 112
            </a>
          </div>
        </section>

        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <SectionTitle
            icon={<MapPin size={18} />}
            title="Current Location"
          />

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MapPin size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {location ? "GPS location acquired" : "Location not acquired"}
                </p>

                <p className="mt-1 break-words text-xs text-slate-500">
                  {location
                    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} · accuracy about ${Math.round(location.accuracy)} m`
                    : "Allow browser location access to attach GPS coordinates to an emergency request."}
                </p>

                {location && (
                  <a
                    href={mapUrl(location.latitude, location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline"
                  >
                    View location on map
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleLocate()}
              disabled={locating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {locating ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LocateFixed size={17} />
              )}

              {locating ? "Getting location..." : "Get current GPS location"}
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setConfirmation({ type: "sos" })}
          disabled={submitting}
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-[24px] bg-red-600 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(220,38,38,0.18)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <Phone size={19} />
          )}

          {submitting ? "Saving emergency request..." : "Request Emergency Assistance"}
        </button>

        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_12px_45px_rgba(20,50,45,0.06)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle
              icon={<HeartPulse size={18} />}
              title="My Emergency History"
            />

            <button
              type="button"
              onClick={() => void loadCases()}
              disabled={loadingCases}
              aria-label="Refresh emergency history"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              {loadingCases ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs leading-5 text-amber-700">
            Requests shown here are database records only. They do not confirm
            ambulance dispatch.
          </p>

          {loadingCases ? (
            <p className="mt-4 text-sm text-slate-500">
              Loading emergency history...
            </p>
          ) : cases.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No emergency requests recorded.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {cases.map((item) => (
                <article
                  key={item.emergency_id}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">
                        Emergency #{item.emergency_id}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 size={12} />
                        {formatDate(item.created_at)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Type: {item.emergency_type}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles(item.status)}`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-3 break-words text-xs leading-5 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  {item.latitude != null && item.longitude != null && (
                    <a
                      href={mapUrl(item.latitude, item.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline"
                    >
                      <MapPin size={14} />
                      View saved location
                    </a>
                  )}

                  <HospitalDestination item={item} />

                  {item.status !== "cancelled" && item.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => void handleStartTracking(item.emergency_id)}
                      disabled={startingTrackingId === item.emergency_id}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {startingTrackingId === item.emergency_id ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Navigation size={17} />
                      )}
                      {startingTrackingId === item.emergency_id
                        ? "Starting demo..."
                        : trackingId === item.emergency_id
                          ? "Restart demo tracking"
                          : "Start demo tracking"}
                    </button>
                  )}

                  {trackingId === item.emergency_id && tracking && (
                    <div className="mt-4">
                      <AmbulanceTrackingMap tracking={tracking} />
                      {trackingError && (
                        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                          {trackingError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={stopViewingTracking}
                        className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
                      >
                        Stop viewing tracking
                      </button>
                    </div>
                  )}

                  {trackingId === item.emergency_id && !tracking && trackingError && (
                    <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                      {trackingError}
                    </p>
                  )}

                  {item.status !== "cancelled" &&
                    item.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => void handleCancel(item.emergency_id)}
                        disabled={cancellingId === item.emergency_id}
                        className="mt-3 flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                      >
                        {cancellingId === item.emergency_id ? (
                          <LoaderCircle
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={14} />
                        )}

                        Cancel request
                      </button>
                    )}
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-5 text-emerald-700">
            SumanCare can save emergency request details and display a hospital
            destination when the backend returns one. Demo tracking is simulated and this prototype does not automatically contact ambulance services, hospitals, or family members. For an actual emergency in India, call 112 directly.
          </p>
        </div>

        <p className="px-4 py-6 text-center text-[11px] leading-5 text-slate-400">
          SumanCare provides health information support and is not a substitute
          for professional medical care.
        </p>
      </div>

      {confirmation && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!submitting && cancellingId === null) setConfirmation(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-description"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                confirmation.type === "cancel"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {confirmation.type === "cancel" ? (
                <XCircle size={27} />
              ) : (
                <ShieldAlert size={27} />
              )}
            </div>

            <h2
              id="confirmation-title"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              {confirmation.type === "cancel"
                ? "Cancel emergency request?"
                : "Request emergency assistance?"}
            </h2>

            <p
              id="confirmation-description"
              className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600"
            >
              {confirmation.type === "cancel"
                ? `Are you sure you want to cancel emergency request #${confirmation.emergencyId}? The demo tracking view will stop if it belongs to this request.`
                : "This will save an emergency request in SumanCare. It does not contact or dispatch an ambulance, hospital, or emergency service."}
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={submitting || cancellingId !== null}
                onClick={() => setConfirmation(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirmation.type === "cancel" ? "Keep emergency" : "Go back"}
              </button>

              <button
                type="button"
                disabled={submitting || cancellingId !== null}
                onClick={async () => {
                  const currentConfirmation = confirmation;
                  if (!currentConfirmation) return;

                  setConfirmation(null);

                  if (currentConfirmation.type === "sos") {
                    await handleSOS();
                  } else {
                    await handleCancel(currentConfirmation.emergencyId);
                  }
                }}
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmation.type === "cancel"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {confirmation.type === "cancel" ? (
                  <>
                    <XCircle size={16} />
                    Yes, cancel request
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm request
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-slate-400">
              For a real emergency in India, call 112 directly.
            </p>
          </div>
        </div>
      )}
    </main>

  );
}
