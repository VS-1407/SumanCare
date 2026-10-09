-- SumanCare migration 001
-- Adds authentication support and multiple medical conditions per patient.
-- Test against sumancare_test before applying to sumancare.

USE sumancare_test;

ALTER TABLE patients
    ADD COLUMN password_hash VARCHAR(255) NULL;

CREATE TABLE medical_conditions (
    condition_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id INT NOT NULL,
    condition_name VARCHAR(150) NOT NULL,
    diagnosed_date DATE NULL,
    status ENUM('active', 'resolved', 'managed') NOT NULL DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (condition_id),
    KEY idx_medical_conditions_patient (patient_id),
    CONSTRAINT fk_medical_conditions_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (patient_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- Keep password_hash nullable during migration.
-- Existing accounts need a safe password setup/reset flow before login is enabled.
-- Enforce email requirements for new registrations in the API first.
