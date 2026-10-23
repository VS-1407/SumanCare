
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Patient
from ..schemas import PatientRegister, PatientLogin

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
security = HTTPBearer()


def get_secret_key():
    key = os.getenv("SECRET_KEY")
    if not key:
        raise RuntimeError("SECRET_KEY is missing from the root .env file")
    return key


def create_access_token(patient: Patient) -> str:
    payload = {
        "patient_id": patient.id,
        "email": patient.email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, get_secret_key(), algorithm=ALGORITHM)


def get_patient_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            get_secret_key(),
            algorithms=[ALGORITHM],
        )
        patient_id = payload.get("patient_id")
        if patient_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=401, detail="Patient not found")

    return patient


@router.post("/register")
def register_patient(patient: PatientRegister, db: Session = Depends(get_db)):
    email = str(patient.email).lower()

    existing = db.query(Patient).filter(Patient.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = pwd_context.hash(patient.password)

    new_patient = Patient(
        name=patient.name.strip(),
        email=email,
        phone=patient.phone,
        password_hash=hashed_password,
    )

    db.add(new_patient)
    try:
        db.commit()
        db.refresh(new_patient)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration could not be completed")

    return {
        "message": "Registration successful",
        "patient_id": new_patient.id,
        "name": new_patient.name,
        "email": new_patient.email,
    }


@router.post("/login")
def login_patient(patient: PatientLogin, db: Session = Depends(get_db)):
    email = str(patient.email).lower()
    existing = db.query(Patient).filter(Patient.email == email).first()

    if not existing or not existing.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    try:
        password_correct = pwd_context.verify(
            patient.password,
            existing.password_hash,
        )
    except (ValueError, TypeError):
        password_correct = False

    if not password_correct:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "access_token": create_access_token(existing),
        "token_type": "bearer",
        "patient_id": existing.id,
        "name": existing.name,
        "email": existing.email,
    }


@router.get("/me")
def get_current_patient(
    patient: Patient = Depends(get_patient_from_token),
):
    return {
        "patient_id": patient.id,
        "name": patient.name,
        "email": patient.email,
        "phone": patient.phone,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
    }
