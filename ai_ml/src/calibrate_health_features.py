
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import (
    brier_score_loss,
    roc_auc_score,
    average_precision_score,
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
OUT = BASE / "models" / "nhanes_diabetes_health_features_calibrated.joblib"

df = pd.read_csv(DATA)
df = df[
    df["RIDAGEYR"].ge(18) & df["DIQ010"].isin([1, 2])
].copy()

df["target"] = (df["DIQ010"] == 1).astype(int)
df["systolic_mean"] = df[
    ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
].mean(axis=1)
df["diastolic_mean"] = df[
    ["BPXODI1", "BPXODI2", "BPXODI3"]
].mean(axis=1)

demo = ["RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3", "DMDEDUC2"]
numeric = ["RIDAGEYR", "INDFMPIR", "BMXBMI",
           "systolic_mean", "diastolic_mean"]
categorical = ["RIAGENDR", "RIDRETH3", "DMDEDUC2"]
features = numeric + [c for c in categorical if c not in numeric]

# Recreate the exact complete-case cohort from the prior experiment
cohort = df.dropna(subset=features + ["target"]).copy()
X = cohort[features]
y = cohort["target"]

X_dev, X_test, y_dev, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Calibration subset comes only from development data
X_base, X_cal, y_base, y_cal = train_test_split(
    X_dev, y_dev, test_size=0.25, random_state=43, stratify=y_dev
)

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
    ("classifier", LogisticRegression(
        max_iter=2000, class_weight="balanced"
    )),
])
base_model.fit(X_base, y_base)

calibrated = CalibratedClassifierCV(
    estimator=FrozenEstimator(base_model),
    method="sigmoid",
)
calibrated.fit(X_cal, y_cal)

base_prob = base_model.predict_proba(X_test)[:, 1]
cal_prob = calibrated.predict_proba(X_test)[:, 1]
prevalence_prob = np.full(len(y_test), y_base.mean())

def report(name, prob):
    print(f"\n{name}")
    print("Brier:", round(brier_score_loss(y_test, prob), 4))
    print("ROC-AUC:", round(roc_auc_score(y_test, prob), 4))
    print("PR-AUC:", round(average_precision_score(y_test, prob), 4))

print("Complete-case cohort:", len(cohort))
print("Development:", len(X_dev), "| Test:", len(X_test))
print("Test prevalence:", round(y_test.mean(), 4))

report("Training-prevalence baseline", prevalence_prob)
report("Health model, uncalibrated", base_prob)
report("Health model, sigmoid calibrated", cal_prob)

OUT.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(calibrated, OUT)
print("\nSaved separately:", OUT)
print("Research use only; not clinically validated.")
