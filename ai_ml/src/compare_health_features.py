
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
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
OUT = BASE / "models" / "nhanes_diabetes_health_features.joblib"

df = pd.read_csv(DATA)

df = df[
    df["RIDAGEYR"].ge(18)
    & df["DIQ010"].isin([1, 2])
].copy()

df["target"] = (df["DIQ010"] == 1).astype(int)

# Average available BP readings; leave missing if none exist.
sys_cols = ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
dia_cols = ["BPXODI1", "BPXODI2", "BPXODI3"]

df["systolic_mean"] = df[sys_cols].mean(axis=1)
df["diastolic_mean"] = df[dia_cols].mean(axis=1)

demo_features = [
    "RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3", "DMDEDUC2"
]
health_features = demo_features + [
    "BMXBMI", "systolic_mean", "diastolic_mean"
]

# Same participants for both models: fair feature comparison
required = health_features + ["target"]
cohort = df.dropna(subset=required).copy()

print("Complete-case participants:", len(cohort))
print("Positive cases:", int(cohort["target"].sum()))
print("Positive prevalence:", round(cohort["target"].mean(), 4))

if len(cohort) < 500 or cohort["target"].nunique() != 2:
    raise ValueError("Insufficient complete-case data for this comparison.")

X = cohort[health_features]
y = cohort["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

def make_model(numeric, categorical):
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

    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(
            max_iter=2000, class_weight="balanced"
        )),
    ])

numeric_demo = ["RIDAGEYR", "INDFMPIR"]
categorical_demo = ["RIAGENDR", "RIDRETH3", "DMDEDUC2"]
numeric_health = numeric_demo + [
    "BMXBMI", "systolic_mean", "diastolic_mean"
]

demo_model = make_model(numeric_demo, categorical_demo)
health_model = make_model(numeric_health, categorical_demo)

demo_model.fit(X_train[demo_features], y_train)
health_model.fit(X_train[health_features], y_train)

demo_prob = demo_model.predict_proba(X_test[demo_features])[:, 1]
health_prob = health_model.predict_proba(X_test[health_features])[:, 1]

def report(name, y_true, probabilities):
    print(f"\n{name}")
    print("ROC-AUC:", round(roc_auc_score(y_true, probabilities), 4))
    print("PR-AUC:", round(average_precision_score(y_true, probabilities), 4))
    print("Brier score:", round(brier_score_loss(y_true, probabilities), 4))

report("Demographics-only (complete-case cohort)", y_test, demo_prob)
report("Demographics + BMI + BP", y_test, health_prob)

joblib.dump(health_model, OUT)
print("\nSaved separate model:", OUT)
print("Research use only; not clinically validated.")
