# SumanCare Schema Review

## Purpose
Propose database changes for review with the FastAPI backend developer.
This document is a proposal, not an executable migration.

## Existing Schema
The original database contains nine core tables:
patients, doctors, health_records, medications,
medication_reminders, appointments, lifestyle_logs,
medical_reports, emergency_contacts.

## Decisions to Confirm
1. Keep patients.patient_id as the canonical patient ID.
2. Keep patient profile fields in patients.
3. Keep email unique; plan existing-record handling before enforcing NOT NULL.
4. Store password hashes only; never store plaintext passwords.
5. Use medical_conditions for multiple patient conditions.
6. Use health_records as the single source for health measurements.
7. Avoid duplicate profile, doctor, and medication data.

## Proposed Additions — Pending Review
- health_records.height_cm
- health_records.temperature_c
- health_records.glucose_context
- A documented blood glucose unit convention.
- patient_allergies table if multiple allergies must be supported.

## API Contract To Confirm
- POST /api/auth/signup
- POST /api/auth/login
- Cookie-based authentication and credentialed CORS.
- Request and response field names.
- Routes and schemas for health records, medications,
  appointments, lifestyle logs, reports, and emergency contacts.

## Migration Safety
- Original database: sumancare
- Test database: sumancare_test
- Migration 001 has been tested on sumancare_test.
- Do not apply migrations to sumancare until backend models,
  existing records, and migration steps have been reviewed.
- Keep database backups private and excluded from Git.

## Status
Awaiting backend model and API contract review.

