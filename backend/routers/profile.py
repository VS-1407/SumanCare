
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Patient, VitalRecord
from ..schemas import PatientProfileCreate, PatientProfileResponse
from .auth import get_patient_from_token

router = APIRouter(prefix="/profile", tags=["Patient Profile"])


def validate_date_of_birth(date_of_birth):
    if date_of_birth is not None and date_of_birth > date.today():
        raise HTTPException(
            status_code=422,
            detail="Date of birth cannot be in the future",
        )


def profile_response(patient: Patient, db: Session):
    # Weight is stored in health_records, not patients.
    latest_vital = (
        db.query(VitalRecord)
        .filter(VitalRecord.patient_id == patient.id)
        .order_by(VitalRecord.recorded_at.desc(), VitalRecord.id.desc())
        .first()
    )

    return {
        "id": patient.id,
        "name": patient.name,
        "email": patient.email,
        "phone": patient.phone,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "height_cm": (
            float(patient.height_cm)
            if patient.height_cm is not None
            else None
        ),
        "weight_kg": (
            float(latest_vital.weight_kg)
            if latest_vital is not None
            and latest_vital.weight_kg is not None
            else None
        ),
        "allergies": patient.allergies,
    }


@router.get("/me", response_model=PatientProfileResponse)
def get_my_profile(
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    return profile_response(patient, db)


@router.post("/me", response_model=PatientProfileResponse)
def create_my_profile(
    profile_data: PatientProfileCreate,
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    validate_date_of_birth(profile_data.date_of_birth)

    profile_fields = (
        "date_of_birth",
        "gender",
        "blood_group",
        "height_cm",
        "allergies",
    )

    if any(getattr(patient, field, None) is not None for field in profile_fields):
        raise HTTPException(
            status_code=409,
            detail="Profile details already exist. Use PUT /profile/me to update them.",
        )

    # Save only fields explicitly supplied with non-None values.
    # A missing phone field will not erase the registered phone number.
    data = profile_data.model_dump(exclude_unset=True)

    allowed_fields = {
        "date_of_birth",
        "gender",
        "blood_group",
        "phone",
        "height_cm",
        "allergies",
    }

    try:
        for field, value in data.items():
            if field in allowed_fields and value is not None:
                setattr(patient, field, value)

        db.commit()
        db.refresh(patient)

    except Exception:
        db.rollback()
        raise

    return profile_response(patient, db)


@router.put("/me", response_model=PatientProfileResponse)
def update_my_profile(
    profile_data: PatientProfileCreate,
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    data = profile_data.model_dump(exclude_unset=True)

    validate_date_of_birth(data.get("date_of_birth"))

    allowed_fields = {
        "date_of_birth",
        "gender",
        "blood_group",
        "phone",
        "height_cm",
        "allergies",
    }

    try:
        for field, value in data.items():
            if field not in allowed_fields:
                continue

            # Never clear an existing value just because the frontend
            # sends null. An explicit non-empty value can update it.
            if value is not None:
                setattr(patient, field, value)

        db.commit()
        db.refresh(patient)

    except Exception:
        db.rollback()
        raise

    return profile_response(patient, db)
