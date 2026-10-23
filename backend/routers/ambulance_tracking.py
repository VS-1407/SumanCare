
import json
import math
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmergencyCase
from .auth import get_patient_from_token


router = APIRouter(
    prefix="/emergencies",
    tags=["Ambulance Tracking"],
)

OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving"
DEMO_JOURNEY_SECONDS = 120.0

# Demo-only in-memory state. Lost when the backend restarts.
_demo_started_at = {}
_demo_routes = {}


def haversine_distance_m(lat1, lon1, lat2, lon2):
    earth_radius_m = 6_371_000

    lat1, lon1, lat2, lon2 = map(
        math.radians,
        [float(lat1), float(lon1), float(lat2), float(lon2)],
    )

    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    return int(
        2
        * earth_radius_m
        * math.asin(min(1.0, math.sqrt(a)))
    )


def get_owned_case(db, emergency_id, patient_id):
    case = (
        db.query(EmergencyCase)
        .filter(
            EmergencyCase.id == emergency_id,
            EmergencyCase.patient_id == patient_id,
        )
        .first()
    )

    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency case not found.",
        )

    if case.status in ("cancelled", "completed"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tracking is unavailable for a closed emergency.",
        )

    if case.latitude is None or case.longitude is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GPS coordinates are required for tracking.",
        )

    return case


def get_demo_destination(case, patient_lat, patient_lon):
    destination_lat = case.destination_latitude
    destination_lon = case.destination_longitude

    # Keep the existing demo fallback when no destination is mapped.
    if destination_lat is None or destination_lon is None:
        destination_lat = patient_lat + 0.008
        destination_lon = patient_lon + 0.008

    destination_lat = float(destination_lat)
    destination_lon = float(destination_lon)

    if not (
        math.isfinite(destination_lat)
        and math.isfinite(destination_lon)
        and -90 <= destination_lat <= 90
        and -180 <= destination_lon <= 180
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The demo destination coordinates are invalid.",
        )

    return destination_lat, destination_lon


def fetch_osrm_route(start_lat, start_lon, end_lat, end_lon):
    # OSRM expects longitude,latitude — not latitude,longitude.
    coordinates = (
        f"{start_lon},{start_lat};"
        f"{end_lon},{end_lat}"
    )

    query = urlencode({
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
    })

    url = f"{OSRM_BASE_URL}/{coordinates}?{query}"

    try:
        with urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))

    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "The demo road-routing service is unavailable. "
                "Please try starting tracking again."
            ),
        ) from exc

    routes = data.get("routes", [])

    if data.get("code") != "Ok" or not routes:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OSRM could not find a drivable route for this demo.",
        )

    raw_coordinates = routes[0].get("geometry", {}).get(
        "coordinates", []
    )

    # Convert OSRM [longitude, latitude] to [latitude, longitude].
    points = []

    for item in raw_coordinates:
        if not isinstance(item, (list, tuple)) or len(item) < 2:
            continue

        lon, lat = float(item[0]), float(item[1])

        if (
            math.isfinite(lat)
            and math.isfinite(lon)
            and -90 <= lat <= 90
            and -180 <= lon <= 180
        ):
            points.append((lat, lon))

    if len(points) < 2:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The routing service returned insufficient route points.",
        )

    # Build cumulative distances so progress follows road distance,
    # rather than simply advancing through the list of coordinates.
    cumulative = [0.0]

    for index in range(1, len(points)):
        previous_lat, previous_lon = points[index - 1]
        current_lat, current_lon = points[index]

        segment_distance = haversine_distance_m(
            previous_lat,
            previous_lon,
            current_lat,
            current_lon,
        )

        cumulative.append(cumulative[-1] + segment_distance)

    total_distance = cumulative[-1]

    if total_distance <= 0:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The returned road route has no measurable distance.",
        )

    return {
        "points": points,
        "cumulative_m": cumulative,
        "distance_m": total_distance,
    }


def position_on_route(route, progress):
    points = route["points"]
    cumulative = route["cumulative_m"]
    target_distance = route["distance_m"] * progress

    if progress <= 0:
        return points[0]

    if progress >= 1:
        return points[-1]

    for index in range(1, len(points)):
        if cumulative[index] >= target_distance:
            segment_start = cumulative[index - 1]
            segment_end = cumulative[index]
            segment_length = segment_end - segment_start

            if segment_length <= 0:
                return points[index]

            fraction = (
                target_distance - segment_start
            ) / segment_length

            start_lat, start_lon = points[index - 1]
            end_lat, end_lon = points[index]

            latitude = start_lat + (
                end_lat - start_lat
            ) * fraction

            longitude = start_lon + (
                end_lon - start_lon
            ) * fraction

            return latitude, longitude

    return points[-1]


@router.post("/{emergency_id}/tracking/demo/start")
def start_demo_tracking(
    emergency_id: int,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    case = get_owned_case(db, emergency_id, patient.id)

    # Repeated starts do not reset an active demo.
    if emergency_id in _demo_started_at:
        return {
            "emergency_id": emergency_id,
            "tracking_mode": "SIMULATED",
            "status": "demo_in_progress",
            "message": (
                "Demo tracking is already running. "
                "No real ambulance has been dispatched."
            ),
            "started": True,
        }

    patient_lat = float(case.latitude)
    patient_lon = float(case.longitude)

    destination_lat, destination_lon = get_demo_destination(
        case,
        patient_lat,
        patient_lon,
    )

    # The demo ambulance starts at the destination and follows the
    # road route toward the patient.
    route = fetch_osrm_route(
        destination_lat,
        destination_lon,
        patient_lat,
        patient_lon,
    )

    _demo_routes[emergency_id] = route
    _demo_started_at[emergency_id] = time.monotonic()

    return {
        "emergency_id": emergency_id,
        "tracking_mode": "SIMULATED",
        "status": "demo_in_progress",
        "message": (
            "Simulation only. The marker follows a cached road route; "
            "no real ambulance has been assigned or dispatched."
        ),
        "started": True,
    }


@router.get("/{emergency_id}/tracking")
def get_tracking(
    emergency_id: int,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    case = get_owned_case(db, emergency_id, patient.id)

    started_at = _demo_started_at.get(emergency_id)
    route = _demo_routes.get(emergency_id)

    if started_at is None or route is None:
        return {
            "emergency_id": emergency_id,
            "tracking_mode": "SIMULATED",
            "status": "not_started",
            "message": "Start demo tracking to simulate ambulance movement.",
            "latitude": None,
            "longitude": None,
            "patient_latitude": float(case.latitude),
            "patient_longitude": float(case.longitude),
            "distance_to_patient_m": None,
            "progress_percent": 0,
            "last_updated": None,
        }

    patient_lat = float(case.latitude)
    patient_lon = float(case.longitude)

    elapsed_seconds = max(
        0.0,
        time.monotonic() - started_at,
    )

    progress = min(
        elapsed_seconds / DEMO_JOURNEY_SECONDS,
        1.0,
    )

    ambulance_lat, ambulance_lon = position_on_route(
        route,
        progress,
    )

    distance_to_patient = haversine_distance_m(
        ambulance_lat,
        ambulance_lon,
        patient_lat,
        patient_lon,
    )

    return {
        "emergency_id": emergency_id,
        "tracking_mode": "SIMULATED",
        "status": (
            "demo_arrived"
            if progress >= 1.0
            else "demo_in_progress"
        ),
        "message": (
            "SIMULATION ONLY — this is not a real ambulance location."
        ),
        "latitude": ambulance_lat,
        "longitude": ambulance_lon,
        "patient_latitude": patient_lat,
        "patient_longitude": patient_lon,
        "distance_to_patient_m": distance_to_patient,
        "progress_percent": round(progress * 100, 1),
        "last_updated": time.time(),
    }
