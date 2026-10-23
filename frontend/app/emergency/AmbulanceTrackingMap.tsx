"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type TrackingData = {
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

type OsrmRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: "LineString";
      coordinates: [number, number][]; // OSRM returns [longitude, latitude]
    };
  }>;
  message?: string;
};

type RoadRoute = {
  positions: [number, number][]; // Leaflet uses [latitude, longitude]
  distanceMeters: number;
  durationSeconds: number;
};

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";
const ROUTE_REFRESH_MS = 15_000;

const ambulanceIcon = L.divIcon({
  className: "",
  html: '<div style="font-size:26px;background:#fff;border-radius:50%;padding:6px;box-shadow:0 2px 8px #0003">🚑</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const patientIcon = L.divIcon({
  className: "",
  html: '<div style="font-size:24px;background:#fff;border-radius:50%;padding:6px;box-shadow:0 2px 8px #0003">📍</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function FitMapToRoute({ route }: { route: RoadRoute | null }) {
  const map = useMap();
  const hasFitRoute = useRef(false);

  useEffect(() => {
    if (!route || route.positions.length < 2 || hasFitRoute.current) return;
    const bounds = L.latLngBounds(route.positions);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
      hasFitRoute.current = true;
    }
  }, [map, route]);

  return null;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatEta(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

export default function AmbulanceTrackingMap({
  tracking,
}: {
  tracking: TrackingData;
}) {
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const lastRouteFetchAt = useRef(0);

  const coordinates = [
    tracking.latitude,
    tracking.longitude,
    tracking.patient_latitude,
    tracking.patient_longitude,
  ];

  const coordinatesValid = coordinates.every(Number.isFinite);
  const latitudesValid =
    tracking.latitude >= -90 && tracking.latitude <= 90 &&
    tracking.patient_latitude >= -90 && tracking.patient_latitude <= 90;
  const longitudesValid =
    tracking.longitude >= -180 && tracking.longitude <= 180 &&
    tracking.patient_longitude >= -180 && tracking.patient_longitude <= 180;

  useEffect(() => {
    if (!coordinatesValid || !latitudesValid || !longitudesValid) return;

    // The tracking endpoint refreshes frequently. Throttle OSRM requests so
    // the public demo service is not called on every 3-second marker update.
    const now = Date.now();
    const waitMs = Math.max(0, ROUTE_REFRESH_MS - (now - lastRouteFetchAt.current));
    let timer: ReturnType<typeof setTimeout> | undefined;

    const fetchRoute = async () => {
      lastRouteFetchAt.current = Date.now();
      setRouteLoading(true);
      setRouteError("");

      try {
        const start = `${tracking.longitude},${tracking.latitude}`;
        const end = `${tracking.patient_longitude},${tracking.patient_latitude}`;
        const url = `${OSRM_BASE_URL}/${start};${end}?overview=full&geometries=geojson&steps=false`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Routing service returned HTTP ${response.status}.`);

        const data = (await response.json()) as OsrmRouteResponse;
        const firstRoute = data.routes?.[0];
        if (data.code !== "Ok" || !firstRoute || firstRoute.geometry.coordinates.length < 2) {
          throw new Error(data.message || "No road route was found between these locations.");
        }

        setRoute({
          positions: firstRoute.geometry.coordinates.map(
            ([longitude, latitude]) => [latitude, longitude],
          ),
          distanceMeters: firstRoute.distance,
          durationSeconds: firstRoute.duration,
        });
      } catch (error) {
        setRouteError(
          error instanceof Error
            ? error.message
            : "Could not load the road route. Please try again.",
        );
      } finally {
        setRouteLoading(false);
      }
    };

    timer = setTimeout(() => void fetchRoute(), waitMs);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    tracking.latitude,
    tracking.longitude,
    tracking.patient_latitude,
    tracking.patient_longitude,
    coordinatesValid,
    latitudesValid,
    longitudesValid,
  ]);

  if (!coordinatesValid || !latitudesValid || !longitudesValid) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Valid tracking coordinates are unavailable.
      </p>
    );
  }

  const progress = Number.isFinite(tracking.progress_percent)
    ? Math.max(0, Math.min(100, tracking.progress_percent))
    : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-amber-100 px-4 py-3 text-xs font-bold text-amber-900">
        DEMO ONLY — NOT A REAL AMBULANCE
      </div>

      <MapContainer
        center={[tracking.patient_latitude, tracking.patient_longitude]}
        zoom={15}
        scrollWheelZoom
        style={{ height: 320, width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapToRoute route={route} />
        {route && (
          <Polyline
            positions={route.positions}
            pathOptions={{ color: "#2563eb", weight: 6, opacity: 0.85 }}
          />
        )}
        <Marker
          position={[tracking.latitude, tracking.longitude]}
          icon={ambulanceIcon}
          title="Simulated ambulance location"
        />
        <Marker
          position={[tracking.patient_latitude, tracking.patient_longitude]}
          icon={patientIcon}
          title="Patient location"
        />
        <Circle
          center={[tracking.patient_latitude, tracking.patient_longitude]}
          radius={30}
          pathOptions={{ color: "#059669", fillColor: "#10b981", fillOpacity: 0.12 }}
        />
      </MapContainer>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Road distance</p>
          <p className="mt-1 text-lg font-bold">
            {route ? formatDistance(route.distanceMeters) : "Calculating…"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Estimated driving time</p>
          <p className="mt-1 text-lg font-bold">
            {route ? formatEta(route.durationSeconds) : "Calculating…"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Demo progress</p>
          <p className="mt-1 text-lg font-bold">{Math.round(progress)}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {routeLoading && (
          <p className="mb-2 text-xs text-slate-500">Updating road route…</p>
        )}
        {routeError && (
          <p className="mb-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Road routing is temporarily unavailable: {routeError} The ambulance marker and demo progress can still update.
          </p>
        )}
        {tracking.status === "demo_arrived" ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <strong>Demo complete:</strong> The simulated trip has reached its demo endpoint. This does not confirm a real-world ambulance arrival.
          </p>
        ) : (
          <p className="text-xs leading-5 text-slate-500">
            Road route and driving duration are provided by OSRM using OpenStreetMap road data. ETA does not include live traffic and is not a real emergency response time. The marker itself follows simulated backend coordinates.
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Route service: OSRM demo server · Map data © OpenStreetMap contributors
        </p>
      </div>
    </div>
  );
}
