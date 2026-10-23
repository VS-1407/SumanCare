
import hashlib
import json
import logging
import math
import secrets
from datetime import datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmergencyCase, EmergencyEvent
from ..schemas import (
    EmergencyCreate,
    EmergencyCaseOut,
    EmergencyEventOut,
    ResponderEmergencyOut,
    ResponderTokenRequest,
)
from .auth import get_patient_from_token


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])

HOSPITAL_SEARCH_RADIUS_M = 5000
HOSPITAL_LOOKUP_TIMEOUT_SECONDS = 5
RESPONDER_TOKEN_TTL_HOURS = 2


def utc_now():
    """Return a naive UTC timestamp for the existing database columns."""
    return datetime.utcnow()


def haversine_distance_m(lat1, lon1, lat2, lon2):
    """Calculate approximate straight-line distance in metres."""
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
        2 * earth_radius_m * math.asin(min(1.0, math.sqrt(a)))
    )


def find_nearby_hospitals(latitude, longitude):
    """
    Find mapped hospitals near GPS coordinates using Nominatim.

    This is a best-effort lookup. Public Nominatim has usage limits
    and may be unavailable. Failures return [] so SOS recording continues.

    Hospital listings do not verify opening hours, emergency capacity,
    or whether the hospital has accepted a patient.
    """
    if latitude is None or longitude is None:
        return []

    try:
        latitude = float(latitude)
        longitude = float(longitude)

        if not (
            -90 <= latitude <= 90
            and -180 <= longitude <= 180
        ):
            logger.warning(
                "Hospital lookup skipped: invalid GPS coordinates."
            )
            return []

        # Approximate a 5 km bounding box around the GPS location.
        lat_delta = HOSPITAL_SEARCH_RADIUS_M / 111_000
        cos_lat = max(
            0.01,
            abs(math.cos(math.radians(latitude))),
        )
        lon_delta = HOSPITAL_SEARCH_RADIUS_M / (111_000 * cos_lat)

        west = max(-180, longitude - lon_delta)
        east = min(180, longitude + lon_delta)
        south = max(-90, latitude - lat_delta)
        north = min(90, latitude + lat_delta)

        params = urlencode({
            "format": "jsonv2",
            "q": "hospital",
            "limit": 10,
            "addressdetails": 1,
            "viewbox": f"{west},{north},{east},{south}",
            "bounded": 1,
        })

        request = Request(
            f"https://nominatim.openstreetmap.org/search?{params}",
            headers={
                "User-Agent": "SumanCare/1.0 (healthcare prototype)",
                "Accept": "application/json",
            },
            method="GET",
        )

        with urlopen(
            request,
            timeout=HOSPITAL_LOOKUP_TIMEOUT_SECONDS,
        ) as response:
            data = json.loads(
                response.read().decode("utf-8")
            )

        if not isinstance(data, list):
            logger.warning(
                "Nominatim returned an unexpected response."
            )
            return []

    except (
        TimeoutError,
        HTTPError,
        URLError,
        OSError,
        ValueError,
        TypeError,
    ) as exc:
        logger.warning(
            "Hospital lookup unavailable (%s). "
            "Continuing without destination.",
            type(exc).__name__,
        )
        return []

    except Exception:
        logger.exception("Unexpected hospital lookup failure.")
        return []

    hospitals = []
    seen = set()

    for item in data:
        if not isinstance(item, dict):
            continue

        category = item.get("category", item.get("class"))
        hospital_type = item.get("type")

        if (
            category not in ("amenity", "healthcare")
            or hospital_type != "hospital"
        ):
            continue

        name = item.get("name")

        if not isinstance(name, str) or not name.strip():
            continue

        try:
            hospital_lat = float(item["lat"])
            hospital_lon = float(item["lon"])

            if not (
                -90 <= hospital_lat <= 90
                and -180 <= hospital_lon <= 180
            ):
                continue

            distance = haversine_distance_m(
                latitude,
                longitude,
                hospital_lat,
                hospital_lon,
            )

        except (
            KeyError,
            TypeError,
            ValueError,
            OverflowError,
        ):
            continue

        if distance > HOSPITAL_SEARCH_RADIUS_M:
            continue

        key = (
            name.strip().casefold(),
            round(hospital_lat, 6),
            round(hospital_lon, 6),
        )

        if key in seen:
            continue

        seen.add(key)

        hospitals.append({
            "name": name.strip()[:200],
            "address": (
                str(item.get("display_name") or "")[:500] or None
            ),
            "latitude": hospital_lat,
            "longitude": hospital_lon,
            "distance_m": distance,
            "source": "openstreetmap-nominatim",
        })

    hospitals.sort(
        key=lambda item: item["distance_m"]
    )

    return hospitals


def create_responder_token():
    """Generate a random credential and store only its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(32)

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    return raw_token, token_hash


def add_emergency_event(
    db,
    emergency_id,
    event_type,
    details,
):
    db.add(
        EmergencyEvent(
            emergency_id=emergency_id,
            event_type=event_type,
            details=details[:500] if details else None,
        )
    )


def get_patient_case(db, emergency_id, patient_id):
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

    return case


@router.post(
    "",
    response_model=EmergencyCaseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_emergency(
    payload: EmergencyCreate,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    try:
        case = EmergencyCase(
            patient_id=patient.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            location_accuracy_m=payload.location_accuracy_m,
            emergency_type=payload.emergency_type,
            description=payload.description,
            status="requested",
        )

        db.add(case)
        db.flush()

        add_emergency_event(
            db,
            case.id,
            "request_created",
            "Emergency request recorded by SumanCare.",
        )

        # Hospital search is best-effort.
        # If it fails, the SOS request can still be saved.
        hospitals = []

        if (
            payload.latitude is not None
            and payload.longitude is not None
        ):
            hospitals = find_nearby_hospitals(
                payload.latitude,
                payload.longitude,
            )

        if hospitals:
            hospital = hospitals[0]

            case.destination_name = hospital["name"]
            case.destination_address = hospital["address"]
            case.destination_latitude = hospital["latitude"]
            case.destination_longitude = hospital["longitude"]
            case.destination_distance_m = hospital["distance_m"]
            case.destination_source = hospital["source"]

            add_emergency_event(
                db,
                case.id,
                "destination_suggested",
                (
                    f"Suggested hospital: {hospital['name']}; "
                    f"straight-line distance: "
                    f"{hospital['distance_m']} m. "
                    "Availability and acceptance are unconfirmed."
                ),
            )

        elif (
            payload.latitude is not None
            and payload.longitude is not None
        ):
            add_emergency_event(
                db,
                case.id,
                "hospital_lookup_unavailable",
                (
                    "No mapped hospital candidate found; "
                    "no destination assigned."
                ),
            )

        else:
            add_emergency_event(
                db,
                case.id,
                "location_unavailable",
                "SOS created without GPS coordinates.",
            )

        raw_token, token_hash = create_responder_token()

        case.responder_token_hash = token_hash
        case.responder_token_expires_at = (
            utc_now()
            + timedelta(hours=RESPONDER_TOKEN_TTL_HOURS)
        )
        case.responder_token_revoked_at = None

        add_emergency_event(
            db,
            case.id,
            "responder_token_created",
            "Time-limited responder credential generated.",
        )

        db.commit()
        db.refresh(case)

        # Return the raw token only in this creation response.
        return {
            "emergency_id": case.id,
            "latitude": case.latitude,
            "longitude": case.longitude,
            "location_accuracy_m": case.location_accuracy_m,
            "emergency_type": case.emergency_type,
            "description": case.description,
            "status": case.status,
            "destination_name": case.destination_name,
            "destination_address": case.destination_address,
            "destination_latitude": case.destination_latitude,
            "destination_longitude": case.destination_longitude,
            "destination_distance_m": case.destination_distance_m,
            "destination_source": case.destination_source,
            "responder_token_expires_at": (
                case.responder_token_expires_at
            ),
            "responder_token_revoked_at": (
                case.responder_token_revoked_at
            ),
            "responder_access_token": raw_token,
            "created_at": case.created_at,
            "updated_at": case.updated_at,
            "closed_at": case.closed_at,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        logger.exception("Failed to create emergency")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to record the emergency request. "
                "Check backend logs."
            ),
        )


@router.get(
    "",
    response_model=list[EmergencyCaseOut],
)
def list_my_emergencies(
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    return (
        db.query(EmergencyCase)
        .filter(
            EmergencyCase.patient_id == patient.id
        )
        .order_by(
            EmergencyCase.created_at.desc()
        )
        .all()
    )


@router.get(
    "/{emergency_id}",
    response_model=EmergencyCaseOut,
)
def get_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    return get_patient_case(
        db,
        emergency_id,
        patient.id,
    )


@router.get(
    "/{emergency_id}/events",
    response_model=list[EmergencyEventOut],
)
def get_emergency_events(
    emergency_id: int,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    get_patient_case(
        db,
        emergency_id,
        patient.id,
    )

    return (
        db.query(EmergencyEvent)
        .filter(
            EmergencyEvent.emergency_id == emergency_id
        )
        .order_by(
            EmergencyEvent.event_time.asc()
        )
        .all()
    )


@router.post(
    "/{emergency_id}/cancel",
    response_model=EmergencyCaseOut,
)
def cancel_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    case = get_patient_case(
        db,
        emergency_id,
        patient.id,
    )

    if case.status in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot cancel a case with status "
                f"'{case.status}'."
            ),
        )

    try:
        case.status = "cancelled"
        case.closed_at = utc_now()
        case.responder_token_revoked_at = utc_now()

        add_emergency_event(
            db,
            case.id,
            "request_cancelled",
            (
                "Patient cancelled the request; "
                "responder token revoked."
            ),
        )

        db.commit()
        db.refresh(case)

        return case

    except Exception:
        db.rollback()
        logger.exception(
            "Failed to cancel emergency %s",
            emergency_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to cancel the emergency request.",
        )


@router.post(
    "/{emergency_id}/responder-access",
    response_model=ResponderEmergencyOut,
)
def get_responder_emergency(
    emergency_id: int,
    payload: ResponderTokenRequest,
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(
        payload.token.encode("utf-8")
    ).hexdigest()

    case = (
        db.query(EmergencyCase)
        .filter(
            EmergencyCase.id == emergency_id,
            EmergencyCase.responder_token_hash == token_hash,
        )
        .first()
    )

    if case is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid responder credential.",
        )

    now = utc_now()

    if (
        case.responder_token_revoked_at is not None
        or case.responder_token_expires_at is None
        or case.responder_token_expires_at <= now
        or case.status in ("cancelled", "completed")
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Responder credential expired or revoked.",
        )

    return {
        "emergency_id": case.id,
        "emergency_type": case.emergency_type,
        "description": case.description,
        "status": case.status,
        "latitude": case.latitude,
        "longitude": case.longitude,
        "location_accuracy_m": case.location_accuracy_m,
        "destination_name": case.destination_name,
        "destination_address": case.destination_address,
        "destination_latitude": case.destination_latitude,
        "destination_longitude": case.destination_longitude,
        "destination_distance_m": case.destination_distance_m,
        "created_at": case.created_at,
    }
