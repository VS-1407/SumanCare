# SumanCare Database

## Overview

MySQL database for the SumanCare patient health and wellness prototype.

## Database Configuration

* **Database:** `sumancare`
* **Engine:** InnoDB
* **Character set:** `utf8mb4`
* **MySQL version:** MySQL 8.0 or compatible

## Core Tables

| Table                  | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `patients`             | Patient profiles and assigned doctor          |
| `doctors`              | Doctor and hospital information               |
| `health_records`       | Patient health measurements                   |
| `medications`          | Medicine details, dosage, and remaining stock |
| `medication_reminders` | Scheduled doses and reminder status           |
| `appointments`         | Patient appointments                          |
| `lifestyle_logs`       | Daily activity, water intake, and sleep       |
| `medical_reports`      | Medical report metadata and file paths        |
| `emergency_contacts`   | Patient emergency contacts                    |

## Relationships

* Patients can be associated with a doctor.
* Patients can have multiple health records, medications, appointments, lifestyle logs, medical reports, and emergency contacts.
* Medications can have multiple reminders.

## Schema Setup

1. Install MySQL Server 8.0 or a compatible version.
2. Create the `sumancare` database.
3. Run `schema.sql` to create the nine core tables in a clean development database.
4. Configure database credentials through environment variables in the backend.
5. Verify the tables with `SHOW TABLES;`.

**Important:** `schema.sql` defines the original core schema. It does not include the data from the local database backup.

## Migrations

The `migrations/` directory contains versioned SQL changes.

### Migration 001

`001_add_patient_auth_and_conditions.sql` is a development migration tested against `sumancare_test`. It:

* Adds nullable `password_hash` storage to `patients`.
* Creates `medical_conditions` to support multiple conditions per patient.

The migration currently targets `sumancare_test`. Do not run it against the original `sumancare` database without reviewing the backend contract and preparing an approved production migration.

Email constraints, existing-account handling, and additional health measurement fields remain subject to review.

## Security and Development Notes

* Use synthetic data for development and demonstrations.
* Never commit passwords, credentials, or real patient information.
* Keep database backups private and excluded from Git.
* Store uploaded report files separately from their database metadata.
* Coordinate table names, column names, and API contracts with the FastAPI backend before integration.
* Health readings and risk scores are informational and should not be presented as a medical diagnosis.

## Current Status

* Nine core tables exist in the original database.
* The schema export is saved as `schema.sql`.
* A private backup of the original database exists locally.
* Migration 001 has been tested on `sumancare_test`.
* Backend integration and final schema alignment are pending.
