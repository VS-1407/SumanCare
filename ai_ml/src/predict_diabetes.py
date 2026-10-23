
from pathlib import Path
from numbers import Real

import joblib
import pandas as pd


# --------------------------------------------------
# Project paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ai_ml" / "models" / "diabetes_calibrated.joblib"


# --------------------------------------------------
# Load model once
# --------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Features in the exact training order
# CDC Diabetes Health Indicators dataset
# --------------------------------------------------

FEATURES = [
    "HighBP",
    "HighChol",
    "CholCheck",
    "BMI",
    "Smoker",
    "Stroke",
    "HeartDiseaseorAttack",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "AnyHealthcare",
    "NoDocbcCost",
    "GenHlth",
    "MentHlth",
    "PhysHlth",
    "DiffWalk",
    "Sex",
    "Age",
    "Education",
    "Income",
]


# Binary features in the CDC dataset
BINARY_FEATURES = [
    "HighBP",
    "HighChol",
    "CholCheck",
    "Smoker",
    "Stroke",
    "HeartDiseaseorAttack",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "AnyHealthcare",
    "NoDocbcCost",
    "DiffWalk",
    "Sex",
]


# CDC survey scales are not all equivalent to
# a patient's measured clinical values.
VALID_RANGES = {
    "HighBP": (0, 1),
    "HighChol": (0, 1),
    "CholCheck": (0, 1),
    "BMI": (1, 100),
    "Smoker": (0, 1),
    "Stroke": (0, 1),
    "HeartDiseaseorAttack": (0, 1),
    "PhysActivity": (0, 1),
    "Fruits": (0, 1),
    "Veggies": (0, 1),
    "HvyAlcoholConsump": (0, 1),
    "AnyHealthcare": (0, 1),
    "NoDocbcCost": (0, 1),
    "GenHlth": (1, 5),
    "MentHlth": (0, 30),
    "PhysHlth": (0, 30),
    "DiffWalk": (0, 1),
    "Sex": (0, 1),
    "Age": (1, 13),
    "Education": (1, 6),
    "Income": (1, 8),
}


def validate_input(data: dict) -> None:
    """Validate feature names, numeric values, and dataset ranges."""

    if not isinstance(data, dict):
        raise ValueError("Input must be a dictionary.")

    missing = [feature for feature in FEATURES if feature not in data]
    extra = [feature for feature in data if feature not in FEATURES]

    if missing:
        raise ValueError(
            f"Missing required features: {missing}"
        )

    if extra:
        raise ValueError(
            f"Unexpected features: {extra}"
        )

    for feature in FEATURES:
        value = data[feature]

        if value is None or isinstance(value, bool):
            raise ValueError(
                f"{feature} must be a valid numeric value."
            )

        if not isinstance(value, Real):
            raise ValueError(
                f"{feature} must be numeric."
            )

        if pd.isna(value):
            raise ValueError(
                f"{feature} cannot be missing."
            )

        minimum, maximum = VALID_RANGES[feature]

        if not minimum <= value <= maximum:
            raise ValueError(
                f"{feature} must be between "
                f"{minimum} and {maximum}."
            )

        if feature in BINARY_FEATURES and value not in (0, 1):
            raise ValueError(
                f"{feature} must be 0 or 1."
            )

        if feature != "BMI" and not float(value).is_integer():
            raise ValueError(
                f"{feature} must be an integer."
            )


def predict_diabetes_label_probability(data: dict) -> dict:
    """
    Estimate the probability of the positive label learned
    from the CDC Diabetes Health Indicators survey dataset.

    Research prototype only. This output is not a diagnosis
    or a clinically validated estimate of future diabetes risk.
    """

    validate_input(data)

    # Preserve the exact feature order used during training.
    row = pd.DataFrame(
        [[data[feature] for feature in FEATURES]],
        columns=FEATURES,
    )

    probabilities = model.predict_proba(row)

    # Locate the positive class explicitly rather than assuming
    # that class 1 is always at index 1.
    classes = list(model.classes_)

    if 1 not in classes:
        raise RuntimeError(
            "The loaded model does not contain positive class 1."
        )

    positive_index = classes.index(1)
    probability = float(probabilities[0][positive_index])

    if not 0.0 <= probability <= 1.0:
        raise RuntimeError(
            "The model returned an invalid probability."
        )

    return {
        "experimental_positive_label_probability": round(
            probability, 4
        ),
        "target": "CDC survey diabetes-related label",
        "clinical_status": "not_clinically_validated",
        "disclaimer": (
            "Research prototype only. This value is not a diagnosis "
            "or a prediction of future diabetes risk. It reflects "
            "the model's output for the CDC survey feature inputs."
        ),
    }
