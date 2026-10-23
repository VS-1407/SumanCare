
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, AliasChoices


class PatientRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone: Optional[str] = Field(default=None, max_length=20)


class PatientLogin(BaseModel):
    email: EmailStr
    password: str


class PatientProfileCreate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(default=None, max_length=30)
    blood_group: Optional[str] = Field(default=None, max_length=5)
    phone: Optional[str] = Field(default=None, max_length=20)
    height_cm: Optional[float] = Field(default=None, gt=0, le=300)
    weight_kg: Optional[float] = Field(default=None, gt=0, le=500)
    allergies: Optional[str] = Field(default=None, max_length=500)


class PatientProfileResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    allergies: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MedicalConditionCreate(BaseModel):
    condition_name: str = Field(min_length=1, max_length=150)
    diagnosed_date: Optional[date] = None
    status: str = Field(
        default="active",
        pattern="^(active|resolved|managed)$",
    )
    notes: Optional[str] = None


class MedicalConditionResponse(BaseModel):
    id: int
    patient_id: int
    condition_name: str
    diagnosed_date: Optional[date] = None
    status: str = "active"
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VitalRecordCreate(BaseModel):
    heart_rate: Optional[int] = Field(default=None, gt=0, le=300)
    systolic_bp: Optional[int] = Field(default=None, gt=0, le=300)
    diastolic_bp: Optional[int] = Field(default=None, gt=0, le=200)
    blood_glucose: Optional[float] = Field(default=None, gt=0, le=2000)
    weight_kg: Optional[float] = Field(default=None, gt=0, le=500)
    oxygen_level: Optional[float] = Field(default=None, gt=0, le=100)
    notes: Optional[str] = None


class VitalRecordResponse(BaseModel):
    id: int
    patient_id: int
    recorded_at: Optional[datetime] = None
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_glucose: Optional[Decimal] = None
    weight_kg: Optional[Decimal] = None
    oxygen_level: Optional[Decimal] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EmergencyCreate(BaseModel):
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    location_accuracy_m: Optional[float] = Field(default=None, ge=0)
    emergency_type: Literal[
        "general", "medical", "accident", "other"
    ] = "general"
    description: Optional[str] = Field(default=None, max_length=500)


class EmergencyResponseOut(BaseModel):
    response_id: int = Field(validation_alias="id")
    provider_type: Literal["hospital", "ambulance"]
    provider_name: Optional[str] = None
    status: Literal[
        "pending",
        "accepted",
        "rejected",
        "unavailable",
        "dispatched",
        "completed",
    ]
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmergencyEventOut(BaseModel):
    event_id: int = Field(validation_alias="id")
    event_type: str
    details: Optional[str] = None
    event_time: datetime

    model_config = ConfigDict(from_attributes=True)


class EmergencyCaseOut(BaseModel):
    # Supports both SQLAlchemy objects (attribute: id)
    # and dictionaries (key: emergency_id or id).
    emergency_id: int = Field(
        validation_alias=AliasChoices("emergency_id", "id")
    )

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_accuracy_m: Optional[float] = None

    emergency_type: str
    description: Optional[str] = None

    destination_name: Optional[str] = None
    destination_address: Optional[str] = None
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    destination_distance_m: Optional[int] = None
    destination_source: Optional[str] = None

    # Never expose token hashes or raw tokens in normal list/detail responses.
    responder_token_expires_at: Optional[datetime] = None
    responder_token_revoked_at: Optional[datetime] = None
    responder_access_token: Optional[str] = None

    status: Literal[
        "requested",
        "accepted",
        "dispatched",
        "completed",
        "cancelled",
    ]

    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ResponderEmergencyOut(BaseModel):
    emergency_id: int
    emergency_type: str
    description: Optional[str] = None
    status: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_accuracy_m: Optional[float] = None

    destination_name: Optional[str] = None
    destination_address: Optional[str] = None
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    destination_distance_m: Optional[int] = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResponderTokenRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
