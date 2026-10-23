
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Patient, VitalRecord
from ..schemas import VitalRecordCreate, VitalRecordResponse
from .auth import get_patient_from_token


router = APIRouter(prefix="/vitals", tags=["Vitals"])


@router.post("/", response_model=VitalRecordResponse)
def add_vitals(
    vital_data: VitalRecordCreate,
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    measurements = vital_data.model_dump(exclude={"notes"})

    if all(value is None for value in measurements.values()):
        raise HTTPException(
            status_code=422,
            detail="At least one vital measurement is required",
        )

    new_vital = VitalRecord(
        patient_id=patient.id,
        heart_rate=vital_data.heart_rate,
        systolic_bp=vital_data.systolic_bp,
        diastolic_bp=vital_data.diastolic_bp,
        blood_glucose=vital_data.blood_glucose,
        weight_kg=vital_data.weight_kg,
        oxygen_level=vital_data.oxygen_level,
        notes=vital_data.notes,
    )

    db.add(new_vital)
    try:
        db.commit()
        db.refresh(new_vital)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save vital measurements",
        )

    return new_vital


@router.get("/", response_model=list[VitalRecordResponse])
def get_vitals(
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    return (
        db.query(VitalRecord)
        .filter(VitalRecord.patient_id == patient.id)
        .order_by(VitalRecord.id.desc())
        .all()
    )
