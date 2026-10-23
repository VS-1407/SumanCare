
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LifestyleLog, Patient
from .auth import get_patient_from_token


router = APIRouter(prefix="/lifestyle", tags=["Lifestyle"])


class LifestyleLogInput(BaseModel):
    water_intake_liters: Optional[Decimal] = Field(
        default=None, ge=0, le=15
    )
    steps: Optional[int] = Field(default=None, ge=0, le=100000)
    sleep_hours: Optional[Decimal] = Field(default=None, ge=0, le=24)
    activity_minutes: Optional[int] = Field(
        default=None, ge=0, le=1440
    )
    mood: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = None
    stress_level: Optional[str] = Field(
        default=None, pattern="^(Low|Moderate|High)$"
    )
    meal_quality: Optional[str] = Field(
        default=None, pattern="^(Poor|Average|Good)$"
    )
    medication_status: Optional[str] = Field(
        default=None, pattern="^(Taken|Missed)$"
    )

    model_config = ConfigDict(extra="forbid")


class LifestyleLogResponse(LifestyleLogInput):
    id: int
    patient_id: int
    log_date: date

    model_config = ConfigDict(from_attributes=True)


@router.get("/today", response_model=Optional[LifestyleLogResponse])
def get_today_lifestyle(
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    return (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.patient_id == patient.id,
            LifestyleLog.log_date == date.today(),
        )
        .first()
    )


@router.put("/today", response_model=LifestyleLogResponse)
def save_today_lifestyle(
    data: LifestyleLogInput,
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    log = (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.patient_id == patient.id,
            LifestyleLog.log_date == date.today(),
        )
        .first()
    )

    if log is None:
        log = LifestyleLog(
            patient_id=patient.id,
            log_date=date.today(),
        )
        db.add(log)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(log, field, value)

    try:
        db.commit()
        db.refresh(log)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save today's lifestyle log",
        )

    return log
