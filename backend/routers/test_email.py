
import os

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, EmailStr
from ..email_service import send_emergency_email

router = APIRouter(prefix="/test-email", tags=["Email Testing"])


class TestEmailRequest(BaseModel):
    recipient_email: EmailStr


@router.post("/")
def test_email(
    data: TestEmailRequest,
    x_test_token: str = Header(default=""),
):
    expected_token = os.getenv("EMAIL_TEST_TOKEN")

    if not expected_token or x_test_token != expected_token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        result = send_emergency_email(
            recipient_email=str(data.recipient_email),
            contact_name="SumanCare Test",
            patient_name="Test Patient",
            emergency_message="This is a test notification. No real emergency has been reported.",
        )
        return {"message": "Email request submitted", "result": result}
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Email sending failed. Check backend logs and Resend configuration.",
        )
