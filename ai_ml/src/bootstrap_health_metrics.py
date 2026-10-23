
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
MODEL = BASE / "models" / "nhanes_diabetes_health_features_calibrated.joblib"

df = pd.read_csv(DATA)
df = df[df["RIDAGEYR"].ge(18) & df["DIQ010"].isin([1, 2])].copy()
df["target"] = (df["DIQ010"] == 1).astype(int)

df["systolic_mean"] = df[
    ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
].mean(axis=1)
df["diastolic_mean"] = df[
    ["BPXODI1", "BPXODI2", "BPXODI3"]
].mean(axis=1)

features = [
    "RIDAGEYR", "INDFMPIR", "BMXBMI",
    "systolic_mean", "diastolic_mean",
    "RIAGENDR", "RIDRETH3", "DMDEDUC2",
]
cohort = df.dropna(subset=features + ["target"]).copy()

X = cohort[features]
y = cohort["target"]

_, X_test, _, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

model = joblib.load(MODEL)
prob = model.predict_proba(X_test)[:, 1]

# Ordinary participant-level bootstrap; does not account for
# NHANES strata, clusters, or survey weights.
rng = np.random.default_rng(42)
auc_values = []
ap_values = []

y_array = y_test.to_numpy()

for _ in range(2000):
    idx = rng.integers(0, len(y_array), size=len(y_array))
    y_sample = y_array[idx]
    p_sample = prob[idx]

    if np.unique(y_sample).size < 2:
        continue

    auc_values.append(roc_auc_score(y_sample, p_sample))
    ap_values.append(average_precision_score(y_sample, p_sample))

def show_ci(name, values):
    lo, hi = np.percentile(values, [2.5, 97.5])
    print(f"{name}: 95% bootstrap CI [{lo:.4f}, {hi:.4f}]")

print("ROC-AUC point estimate:", round(roc_auc_score(y_test, prob), 4))
show_ci("ROC-AUC", auc_values)

print("PR-AUC point estimate:", round(average_precision_score(y_test, prob), 4))
show_ci("PR-AUC", ap_values)

print("\nExploratory intervals only; NHANES survey design not accounted for.")
