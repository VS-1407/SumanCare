
import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")


def send_emergency_email(
    recipient_email: str,
    contact_name: str,
    patient_name: str,
    emergency_message: str,
):
    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")

    params = {
        "from": os.getenv(
            "RESEND_FROM_EMAIL",
            "onboarding@resend.dev",
        ),
        "to": [recipient_email],
        "subject": f"Emergency Alert - {patient_name}",
        "html": f"""
            <h2>Emergency Alert - SumanCare</h2>
            <p>Hello {contact_name},</p>
            <p>An emergency alert has been triggered for
            <strong>{patient_name}</strong>.</p>
            <p>{emergency_message}</p>
            <p>Please contact the patient and verify their safety.</p>
            <p>This is an automated notification from SumanCare.</p>
        """,
    }

    return resend.Emails.send(params)
