
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import brier_score_loss, roc_auc_score, average_precision_score

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
OUT = BASE / "models" / "nhanes_diabetes_demographics_calibrated.joblib"

df = pd.read_csv(DATA)
df = df[
    df["RIDAGEYR"].ge(18) & df["DIQ010"].isin([1, 2])
].copy()

y = (df["DIQ010"] == 1).astype(int)
X = df[["RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3", "DMDEDUC2"]]

# Preserve a final test set; calibration must not use it
X_dev, X_test, y_dev, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Split development data into base-model and calibration subsets
X_base, X_cal, y_base, y_cal = train_test_split(
    X_dev, y_dev, test_size=0.25, random_state=43, stratify=y_dev
)

numeric = ["RIDAGEYR", "INDFMPIR"]
categorical = ["RIAGENDR", "RIDRETH3", "DMDEDUC2"]

preprocessor = ColumnTransformer([
    ("num", Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ]), numeric),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ]), categorical),
])

base_model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegression(max_iter=2000, class_weight="balanced")),
])

base_model.fit(X_base, y_base)

# Freeze the fitted base model; use calibration subset only for sigmoid fit
calibrated = CalibratedClassifierCV(
    estimator=FrozenEstimator(base_model),
    method="sigmoid",
)
calibrated.fit(X_cal, y_cal)

# Compare on the same untouched test set
base_prob = base_model.predict_proba(X_test)[:, 1]
cal_prob = calibrated.predict_proba(X_test)[:, 1]

prevalence_prob = np.full(len(y_test), y_base.mean())

def report(name, probabilities):
    print(f"\n{name}")
    print("Brier score:", round(brier_score_loss(y_test, probabilities), 4))
    print("ROC-AUC:", round(roc_auc_score(y_test, probabilities), 4))
    print("PR-AUC:", round(average_precision_score(y_test, probabilities), 4))

report("Training-prevalence baseline", prevalence_prob)
report("Uncalibrated model", base_prob)
report("Sigmoid-calibrated model", cal_prob)

print("\nCalibration table (calibrated model):")
observed, predicted = calibration_curve(
    y_test, cal_prob, n_bins=10, strategy="quantile"
)
for p, o in zip(predicted, observed):
    print(f"Mean predicted={p:.4f}, observed={o:.4f}")

joblib.dump(calibrated, OUT)
print("\nSaved separately to:", OUT)
print("Research use only; not clinically validated.")
