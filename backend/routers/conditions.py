
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MedicalCondition, Patient
from ..schemas import MedicalConditionCreate, MedicalConditionResponse
from .auth import get_patient_from_token


router = APIRouter(prefix="/conditions", tags=["Medical Conditions"])


@router.get("/", response_model=list[MedicalConditionResponse])
def get_my_conditions(
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    return (
        db.query(MedicalCondition)
        .filter(MedicalCondition.patient_id == patient.id)
        .order_by(MedicalCondition.id.desc())
        .all()
    )


@router.post("/", response_model=MedicalConditionResponse)
def create_condition(
    condition_data: MedicalConditionCreate,
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    condition_name = condition_data.condition_name.strip()
    if not condition_name:
        raise HTTPException(status_code=422, detail="Condition name is required")

    condition = MedicalCondition(
        patient_id=patient.id,
        condition_name=condition_name,
        diagnosed_date=condition_data.diagnosed_date,
        status=condition_data.status,
        notes=condition_data.notes,
    )

    db.add(condition)
    try:
        db.commit()
        db.refresh(condition)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save medical condition")

    return condition
