
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmergencyContact

router = APIRouter(
    prefix="/emergency-contacts",
    tags=["Emergency Contacts"],
)


class ContactCreate(BaseModel):
    contact_name: str = Field(min_length=1, max_length=100)
    relationship: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=20)
    email_alert_enabled: bool = True
    whatsapp_alert_enabled: bool = True
    consent_confirmed: bool = False


@router.post("/")
def create_contact(
    data: ContactCreate,
    patient_id: int,
    db: Session = Depends(get_db),
):
    if not data.email and not data.phone:
        raise HTTPException(
            status_code=400,
            detail="Provide an email address or phone number.",
        )

    contact = EmergencyContact(
        patient_id=patient_id,
        **data.model_dump(),
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {
        "message": "Emergency contact saved",
        "contact_id": contact.id,
        "contact_name": contact.contact_name,
    }


@router.get("/")
def list_contacts(
    patient_id: int,
    db: Session = Depends(get_db),
):
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.patient_id == patient_id)
        .all()
    )

    return [
        {
            "contact_id": contact.id,
            "contact_name": contact.contact_name,
            "relationship": contact.relationship,
            "email": contact.email,
            "phone": contact.phone,
            "email_alert_enabled": contact.email_alert_enabled,
            "whatsapp_alert_enabled": contact.whatsapp_alert_enabled,
            "consent_confirmed": contact.consent_confirmed,
        }
        for contact in contacts
    ]
