
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    BigInteger,
    String,
    Text,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    func,
)

from .database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column("patient_id", Integer, primary_key=True, index=True)
    name = Column("full_name", String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)

    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(30), nullable=True)
    blood_group = Column(String(5), nullable=True)

    height_cm = Column(Numeric(5, 2), nullable=True)
    allergies = Column(String(500), nullable=True)

    doctor_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)


class MedicalCondition(Base):
    __tablename__ = "medical_conditions"

    id = Column("condition_id", BigInteger, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    condition_name = Column(String(150), nullable=False)
    diagnosed_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="active")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())


class VitalRecord(Base):
    __tablename__ = "health_records"

    id = Column("record_id", BigInteger, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recorded_at = Column(DateTime, nullable=False, server_default=func.now())
    heart_rate = Column(Integer, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    blood_glucose = Column(Numeric(6, 2), nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)

    oxygen_level = Column(
        "oxygen_saturation",
        Numeric(5, 2),
        nullable=True,
    )

    notes = Column(Text, nullable=True, server_default=None)


class LifestyleLog(Base):
    __tablename__ = "lifestyle_logs"

    id = Column("log_id", BigInteger, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    log_date = Column(Date, nullable=False)
    water_intake_liters = Column(Numeric(4, 2), nullable=True)
    steps = Column(Integer, nullable=True)
    sleep_hours = Column(Numeric(4, 2), nullable=True)
    activity_minutes = Column(Integer, nullable=True)
    calories_consumed = Column(Integer, nullable=True)
    mood = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    stress_level = Column(String(20), nullable=True)
    meal_quality = Column(String(20), nullable=True)
    medication_status = Column(String(20), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())


class EmergencyCase(Base):
    __tablename__ = "emergency_cases"
    __table_args__ = (
        UniqueConstraint(
            "responder_token_hash",
            name="uq_emergency_responder_token_hash",
        ),
    )

    id = Column("emergency_id", BigInteger, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Patient's SOS location
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    location_accuracy_m = Column(Numeric(8, 2), nullable=True)

    emergency_type = Column(
        String(50),
        nullable=False,
        default="general",
        server_default="general",
    )
    description = Column(String(500), nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="requested",
        server_default="requested",
    )

    # Suggested destination hospital
    destination_name = Column(String(200), nullable=True)
    destination_address = Column(String(500), nullable=True)
    destination_latitude = Column(Numeric(10, 7), nullable=True)
    destination_longitude = Column(Numeric(10, 7), nullable=True)
    destination_distance_m = Column(Integer, nullable=True)
    destination_source = Column(String(40), nullable=True)

    # Secure, time-limited responder access
    # Store only the hash of the actual random token.
    responder_token_hash = Column(String(64), nullable=True)
    responder_token_expires_at = Column(DateTime, nullable=True)
    responder_token_revoked_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    closed_at = Column(DateTime, nullable=True)


class EmergencyResponse(Base):
    __tablename__ = "emergency_responses"

    id = Column("response_id", BigInteger, primary_key=True, index=True)

    emergency_id = Column(
        BigInteger,
        ForeignKey("emergency_cases.emergency_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    provider_type = Column(String(20), nullable=False)
    provider_name = Column(String(150), nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="pending",
        server_default="pending",
    )

    external_reference = Column(String(150), nullable=True)

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column("event_id", BigInteger, primary_key=True, index=True)

    emergency_id = Column(
        BigInteger,
        ForeignKey("emergency_cases.emergency_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type = Column(String(60), nullable=False)
    details = Column(String(500), nullable=True)

    event_time = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column("contact_id", BigInteger, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    contact_name = Column(String(100), nullable=False)
    relationship = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)

    email_alert_enabled = Column(
        Boolean, nullable=False, default=True, server_default="1"
    )
    whatsapp_alert_enabled = Column(
        Boolean, nullable=False, default=True, server_default="1"
    )
    consent_confirmed = Column(
        Boolean, nullable=False, default=False, server_default="0"
    )

    created_at = Column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
