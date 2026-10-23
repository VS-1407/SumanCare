
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Patient, VitalRecord, LifestyleLog, MedicalCondition
from .auth import get_patient_from_token

from ai_ml.src.predict_diabetes import (
    predict_diabetes_label_probability,
)


router = APIRouter(prefix="/health-risk", tags=["Health Risk"])


class DiabetesResearchInput(BaseModel):
    """CDC survey-coded inputs for the experimental research model."""

    HighBP: int = Field(ge=0, le=1)
    HighChol: int = Field(ge=0, le=1)
    CholCheck: int = Field(ge=0, le=1)
    BMI: float = Field(ge=1, le=100)
    Smoker: int = Field(ge=0, le=1)
    Stroke: int = Field(ge=0, le=1)
    HeartDiseaseorAttack: int = Field(ge=0, le=1)
    PhysActivity: int = Field(ge=0, le=1)
    Fruits: int = Field(ge=0, le=1)
    Veggies: int = Field(ge=0, le=1)
    HvyAlcoholConsump: int = Field(ge=0, le=1)
    AnyHealthcare: int = Field(ge=0, le=1)
    NoDocbcCost: int = Field(ge=0, le=1)
    GenHlth: int = Field(ge=1, le=5)
    MentHlth: int = Field(ge=0, le=30)
    PhysHlth: int = Field(ge=0, le=30)
    DiffWalk: int = Field(ge=0, le=1)
    Sex: int = Field(ge=0, le=1)
    Age: int = Field(ge=1, le=13)
    Education: int = Field(ge=1, le=6)
    Income: int = Field(ge=1, le=8)


def calculate_monitoring_score(readings):
    """
    Calculate a transparent, rule-based prototype indicator from
    recent blood-pressure readings.

    This is NOT a clinically validated risk score or AI prediction.
    Readings must be ordered newest first.
    """

    bp_readings = [
        reading
        for reading in readings
        if reading.systolic_bp is not None
        and reading.diastolic_bp is not None
    ]

    if len(bp_readings) < 2:
        return {
            "score": None,
            "level": "Insufficient data",
            "explanation": (
                "At least two complete blood-pressure readings are "
                "needed for this prototype trend indicator."
            ),
            "factors": [],
            "readings_analyzed": len(bp_readings),
        }

    score = 0
    factors = []

    # These are simple prototype thresholds, not diagnostic criteria.
    high_count = sum(
        reading.systolic_bp >= 140
        or reading.diastolic_bp >= 90
        for reading in bp_readings
    )

    elevated_count = sum(
        (
            130 <= reading.systolic_bp < 140
            or 80 <= reading.diastolic_bp < 90
        )
        and not (
            reading.systolic_bp >= 140
            or reading.diastolic_bp >= 90
        )
        for reading in bp_readings
    )

    if high_count:
        score += min(60, high_count * 30)
        factors.append(
            f"{high_count} of {len(bp_readings)} recent readings "
            "had systolic BP >= 140 or diastolic BP >= 90."
        )

    if elevated_count:
        score += min(30, elevated_count * 15)
        factors.append(
            f"{elevated_count} recent readings had systolic BP "
            "between 130 and 139 or diastolic BP between 80 and 89, "
            "without meeting the higher prototype threshold."
        )

    newest = bp_readings[0]
    oldest = bp_readings[-1]

    systolic_increased = (
        newest.systolic_bp > oldest.systolic_bp
    )
    diastolic_increased = (
        newest.diastolic_bp > oldest.diastolic_bp
    )

    if systolic_increased and diastolic_increased:
        score += 10
        factors.append(
            "Both systolic and diastolic BP increased between "
            "the oldest and newest available readings."
        )

    score = min(score, 100)

    if score >= 60:
        level = "High monitoring attention"
    elif score >= 30:
        level = "Moderate monitoring attention"
    else:
        level = "Low monitoring attention"

    if not factors:
        factors.append(
            "No repeated elevated blood-pressure pattern was detected "
            "in the available readings."
        )

    return {
        "score": score,
        "level": level,
        "explanation": (
            "Rule-based prototype indicator using recent blood-pressure "
            "readings only. It is not a clinical risk probability."
        ),
        "factors": factors,
        "readings_analyzed": len(bp_readings),
    }


@router.get("/summary")
def get_health_risk_summary(
    patient: Patient = Depends(get_patient_from_token),
    db: Session = Depends(get_db),
):
    # Only fetch records belonging to the authenticated patient.
    readings = (
        db.query(VitalRecord)
        .filter(VitalRecord.patient_id == patient.id)
        .order_by(
            VitalRecord.recorded_at.desc(),
            VitalRecord.id.desc(),
        )
        .limit(3)
        .all()
    )

    latest_vital = readings[0] if readings else None

    latest_lifestyle = (
        db.query(LifestyleLog)
        .filter(LifestyleLog.patient_id == patient.id)
        .order_by(
            LifestyleLog.log_date.desc(),
            LifestyleLog.id.desc(),
        )
        .first()
    )

    conditions = (
        db.query(MedicalCondition)
        .filter(
            MedicalCondition.patient_id == patient.id,
            MedicalCondition.status == "active",
        )
        .all()
    )

    monitoring = calculate_monitoring_score(readings)

    return {
        "assessment_status": (
            "monitoring_available"
            if monitoring["score"] is not None
            else "insufficient_data"
        ),
        "monitoring_score": monitoring["score"],
        "monitoring_level": monitoring["level"],
        "monitoring_explanation": monitoring["explanation"],
        "contributing_factors": monitoring["factors"],
        "readings_analyzed": monitoring["readings_analyzed"],

        "latest_vitals": (
            {
                "recorded_at": latest_vital.recorded_at,
                "heart_rate": latest_vital.heart_rate,
                "systolic_bp": latest_vital.systolic_bp,
                "diastolic_bp": latest_vital.diastolic_bp,
                "blood_glucose": latest_vital.blood_glucose,
                "oxygen_level": latest_vital.oxygen_level,
                "weight_kg": latest_vital.weight_kg,
            }
            if latest_vital
            else None
        ),

        "recent_readings": [
            {
                "recorded_at": reading.recorded_at,
                "systolic_bp": reading.systolic_bp,
                "diastolic_bp": reading.diastolic_bp,
                "blood_glucose": reading.blood_glucose,
                "heart_rate": reading.heart_rate,
            }
            for reading in readings
        ],

        "latest_lifestyle": (
            {
                "log_date": latest_lifestyle.log_date,
                "sleep_hours": latest_lifestyle.sleep_hours,
                "steps": latest_lifestyle.steps,
                "water_intake_liters": (
                    latest_lifestyle.water_intake_liters
                ),
                "activity_minutes": latest_lifestyle.activity_minutes,
                "stress_level": latest_lifestyle.stress_level,
                "meal_quality": latest_lifestyle.meal_quality,
                "medication_status": latest_lifestyle.medication_status,
            }
            if latest_lifestyle
            else None
        ),

        "active_conditions": [
            condition.condition_name
            for condition in conditions
        ],

        "disclaimer": (
            "Prototype monitoring indicator based on blood-pressure "
            "patterns. It is not a validated clinical risk score, "
            "diabetes prediction, or medical diagnosis."
        ),
    }


@router.post("/research-prediction")
def research_diabetes_prediction(
    inputs: DiabetesResearchInput,
    patient: Patient = Depends(get_patient_from_token),
):
    """
    Run the experimental CDC survey model on explicitly supplied data.
    This endpoint is separate from the monitoring indicator.
    """

    try:
        result = predict_diabetes_label_probability(
            inputs.model_dump()
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Research prediction could not be completed.",
        ) from exc

    return {
        "patient_id": patient.id,
        **result,
    }
