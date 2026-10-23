
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
MODEL = BASE / "models" / "nhanes_diabetes_health_features_calibrated.joblib"
OUT = BASE / "reports"
OUT.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA)
df = df.loc[
    df["RIDAGEYR"].ge(18) & df["DIQ010"].isin([1, 2])
].copy()

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
design_cols = ["WTMEC2YR", "SDMVSTRA", "SDMVPSU"]

cohort = df.dropna(
    subset=features + ["target"] + design_cols
).copy()
cohort = cohort.loc[cohort["WTMEC2YR"] > 0].copy()

X = cohort[features]
y = cohort["target"]

# Preserve participant rows and their survey-design fields.
dev_idx, test_idx = train_test_split(
    np.arange(len(cohort)),
    test_size=0.20,
    random_state=42,
    stratify=y,
)

test = cohort.iloc[test_idx].copy()
X_test = test[features]
y_test = test["target"].to_numpy()
weights = test["WTMEC2YR"].to_numpy()

model = joblib.load(MODEL)
prob = model.predict_proba(X_test)[:, 1]

# Save participant-level test predictions for R survey analysis.
predictions = test[
    ["SEQN", "target", "WTMEC2YR", "SDMVSTRA", "SDMVPSU"]
].copy()

predictions["predicted_probability"] = prob

predictions_path = OUT / "health_test_predictions_for_survey.csv"
predictions.to_csv(predictions_path, index=False)

print("Saved test predictions:", predictions_path)
print("Prediction rows:", len(predictions))

def weighted_average(values, w):
    return np.average(np.asarray(values), weights=w)

# Survey-weighted discrimination and probability error.
weighted_roc = roc_auc_score(
    y_test, prob, sample_weight=weights
)
weighted_ap = average_precision_score(
    y_test, prob, sample_weight=weights
)
weighted_brier = brier_score_loss(
    y_test, prob, sample_weight=weights
)

# Weighted constant-prevalence baseline.
dev = cohort.iloc[dev_idx]
dev_prev = np.average(
    dev["target"], weights=dev["WTMEC2YR"]
)
baseline_prob = np.full(len(test), dev_prev)
baseline_brier = brier_score_loss(
    y_test, baseline_prob, sample_weight=weights
)

results = pd.DataFrame([{
    "test_n": len(test),
    "unweighted_test_prevalence": y_test.mean(),
    "weighted_test_prevalence": weighted_average(y_test, weights),
    "weighted_roc_auc": weighted_roc,
    "weighted_average_precision": weighted_ap,
    "weighted_brier": weighted_brier,
    "weighted_baseline_brier": baseline_brier,
    "weighted_brier_improvement": baseline_brier - weighted_brier,
}])

print(results.round(4).to_string(index=False))

out_file = OUT / "health_survey_weighted_metrics.csv"
results.to_csv(out_file, index=False)
print("\nSaved:", out_file)
print(
    "Exploratory weighted metrics only. These are not design-based "
    "confidence intervals and do not establish national model validity."
)
