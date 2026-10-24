
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmergencyCase, EmergencyContact
from ..email_service import send_emergency_email
from .auth import get_patient_from_token

router = APIRouter(prefix="/emergencies", tags=["Emergency SOS"])


class SOSRequest(BaseModel):
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    emergency_type: str = Field(default="general", max_length=50)
    description: str | None = Field(default=None, max_length=500)


@router.post("/sos")
def create_sos(
    data: SOSRequest,
    db: Session = Depends(get_db),
    patient=Depends(get_patient_from_token),
):
    case = EmergencyCase(
        patient_id=patient.id,
        latitude=data.latitude,
        longitude=data.longitude,
        emergency_type=data.emergency_type,
        description=data.description,
        status="requested",
    )

    db.add(case)
    db.commit()
    db.refresh(case)

    contacts = (
        db.query(EmergencyContact)
        .filter(
            EmergencyContact.patient_id == patient.id,
            EmergencyContact.consent_confirmed.is_(True),
            EmergencyContact.email_alert_enabled.is_(True),
            EmergencyContact.email.isnot(None),
        )
        .all()
    )

    sent = 0
    failed = 0

    for contact in contacts:
        try:
            send_emergency_email(
                recipient_email=contact.email,
                contact_name=contact.contact_name,
                patient_name="SumanCare patient",
                emergency_message=(
                    f"An emergency has been reported. "
                    f"Type: {case.emergency_type}. "
                    f"Description: {case.description or 'Not provided'}. "
                    f"Location: {case.latitude}, {case.longitude}."
                ),
            )
            sent += 1
        except Exception:
            # Keep the saved emergency even if email delivery fails.
            failed += 1

    return {
        "message": "Emergency recorded",
        "emergency_id": case.id,
        "status": case.status,
        "family_emails_submitted": sent,
        "email_failures": failed,
    }
