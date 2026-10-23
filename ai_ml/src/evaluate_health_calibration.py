
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
)

from statsmodels.stats.proportion import proportion_confint


# ============================================================
# 1. Paths and configuration
# ============================================================

BASE = Path(__file__).resolve().parents[1]

DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"

MODEL = (
    BASE
    / "models"
    / "nhanes_diabetes_health_features_calibrated.joblib"
)

OUT = BASE / "reports"
OUT.mkdir(parents=True, exist_ok=True)


# ============================================================
# 2. Load and prepare NHANES data
# ============================================================

df = pd.read_csv(DATA)

# Adults with a clear Yes/No self-reported diagnosis
df = df.loc[
    df["RIDAGEYR"].ge(18)
    & df["DIQ010"].isin([1, 2])
].copy()

df["target"] = (df["DIQ010"] == 1).astype(int)

# Mean of available blood pressure readings
sys_cols = ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
dia_cols = ["BPXODI1", "BPXODI2", "BPXODI3"]

df["systolic_mean"] = df[sys_cols].mean(axis=1)
df["diastolic_mean"] = df[dia_cols].mean(axis=1)

features = [
    "RIDAGEYR",
    "INDFMPIR",
    "BMXBMI",
    "systolic_mean",
    "diastolic_mean",
    "RIAGENDR",
    "RIDRETH3",
    "DMDEDUC2",
]

# Recreate the complete-case cohort used during calibration
cohort = df.dropna(subset=features + ["target"]).copy()

X = cohort[features]
y = cohort["target"]


# ============================================================
# 3. Reproduce the original development/test split
# ============================================================

X_dev, X_test, y_dev, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# ============================================================
# 4. Load calibrated model and generate predictions
# ============================================================

model = joblib.load(MODEL)

prob = model.predict_proba(X_test)[:, 1]

# Constant-probability baseline using development prevalence
baseline_prob = np.full(len(y_test), y_dev.mean())


# ============================================================
# 5. Report performance metrics
# ============================================================

baseline_brier = brier_score_loss(y_test, baseline_prob)
model_brier = brier_score_loss(y_test, prob)

print("=" * 58)
print("NHANES HEALTH-FEATURES MODEL EVALUATION")
print("=" * 58)

print("Complete-case participants:", len(cohort))
print("Development participants:", len(X_dev))
print("Test participants:", len(X_test))
print("Test positive cases:", int(y_test.sum()))
print("Test positive prevalence:", round(y_test.mean(), 4))
print("Development positive prevalence:", round(y_dev.mean(), 4))

print("\n===== BRIER SCORE COMPARISON =====")
print("Training-prevalence baseline:", round(baseline_brier, 4))
print("Calibrated model:", round(model_brier, 4))
print(
    "Brier improvement (baseline - model):",
    round(baseline_brier - model_brier, 4),
)

print("\n===== DISCRIMINATION METRICS =====")
print("ROC-AUC:", round(roc_auc_score(y_test, prob), 4))
print(
    "PR-AUC (average precision):",
    round(average_precision_score(y_test, prob), 4),
)


# ============================================================
# 6. Calibration table with 95% Wilson confidence intervals
# ============================================================

calibration_data = pd.DataFrame({
    "target": np.asarray(y_test),
    "probability": prob,
})

# Quantile bins aim for similarly sized groups.
# Duplicate boundaries are dropped if predictions are tied.
calibration_data["bin"] = pd.qcut(
    calibration_data["probability"],
    q=10,
    labels=False,
    duplicates="drop",
)

rows = []

for bin_id, group in calibration_data.groupby(
    "bin", observed=True
):
    n = len(group)
    positives = int(group["target"].sum())
    observed_rate = positives / n
    mean_probability = group["probability"].mean()

    ci_low, ci_high = proportion_confint(
        count=positives,
        nobs=n,
        alpha=0.05,
        method="wilson",
    )

    rows.append({
        "bin": int(bin_id),
        "participants": n,
        "positive_cases": positives,
        "mean_predicted_probability": mean_probability,
        "observed_positive_rate": observed_rate,
        "ci_95_lower": ci_low,
        "ci_95_upper": ci_high,
    })

calibration_table = pd.DataFrame(rows)

table_path = OUT / "health_calibration_table.csv"
calibration_table.to_csv(table_path, index=False)

print("\n===== CALIBRATION TABLE WITH 95% CIs =====")
print(calibration_table.round(4).to_string(index=False))


# ============================================================
# 7. Calibration curve with confidence intervals
# ============================================================

plt.figure(figsize=(8, 7))

# Ideal calibration reference
plt.plot(
    [0, 1],
    [0, 1],
    linestyle="--",
    label="Perfect calibration",
)

# Observed rates with binomial Wilson intervals
yerr_lower = (
    calibration_table["observed_positive_rate"]
    - calibration_table["ci_95_lower"]
).clip(lower=0)

yerr_upper = (
    calibration_table["ci_95_upper"]
    - calibration_table["observed_positive_rate"]
).clip(lower=0)

plt.errorbar(
    calibration_table["mean_predicted_probability"],
    calibration_table["observed_positive_rate"],
    yerr=np.vstack([yerr_lower, yerr_upper]),
    fmt="o-",
    capsize=4,
    label="Calibrated model (95% Wilson CIs)",
)

plt.xlabel("Mean predicted probability")
plt.ylabel("Observed positive rate")
plt.title("NHANES Health-Features Model Calibration")
plt.xlim(0, 1)
plt.ylim(0, 1)
plt.legend()
plt.grid(alpha=0.2)
plt.tight_layout()

curve_path = OUT / "health_calibration_curve.png"
plt.savefig(curve_path, dpi=160)
plt.close()


# ============================================================
# 8. Save report locations
# ============================================================

print("\n===== SAVED REPORTS =====")
print("Calibration table:", table_path)
print("Calibration curve:", curve_path)

print("\nResearch evaluation only; not clinical validation.")
print(
    "Results apply to the unweighted complete-case test cohort."
)
print(
    "Wilson intervals describe binomial uncertainty per bin; "
    "they do not account for NHANES survey design."
)
