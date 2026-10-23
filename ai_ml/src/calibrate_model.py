
from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import GroupShuffleSplit
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    brier_score_loss,
    roc_auc_score,
    log_loss,
)

ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    ROOT / "ai_ml" / "data" / "raw"
    / "cdc_diabetes_health_indicators.csv"
)

df = pd.read_csv(DATA_PATH)
X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

# Keep identical feature combinations together.
groups = pd.util.hash_pandas_object(X, index=False)

# First split: 80% development, 20% final test.
outer = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42,
)

dev_idx, test_idx = next(outer.split(X, y, groups=groups))

X_dev, y_dev = X.iloc[dev_idx], y.iloc[dev_idx]
X_test, y_test = X.iloc[test_idx], y.iloc[test_idx]
groups_dev = groups.iloc[dev_idx]

# Split development data into model-training and calibration sets.
inner = GroupShuffleSplit(
    n_splits=1,
    test_size=0.25,
    random_state=43,
)

fit_rel, cal_rel = next(
    inner.split(X_dev, y_dev, groups=groups_dev)
)

X_fit, y_fit = X_dev.iloc[fit_rel], y_dev.iloc[fit_rel]
X_cal, y_cal = X_dev.iloc[cal_rel], y_dev.iloc[cal_rel]

print("Training rows:", len(X_fit))
print("Calibration rows:", len(X_cal))
print("Final test rows:", len(X_test))

# Train the original model only on the fit subset.
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

base_model = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42,
    )),
])

base_model.fit(X_fit, y_fit)

# Calibrate on the separate calibration subset.
from sklearn.frozen import FrozenEstimator

calibrated_model = CalibratedClassifierCV(
    estimator=FrozenEstimator(base_model),
    method="sigmoid",
)

calibrated_model.fit(X_cal, y_cal)

# Evaluate both on the same untouched test subset.
raw_probs = base_model.predict_proba(X_test)[:, 1]
cal_probs = calibrated_model.predict_proba(X_test)[:, 1]

baseline_prob = y_fit.mean()
baseline_probs = [baseline_prob] * len(y_test)

def report(name, probs):
    print(f"\n{name}")
    print("Brier score:", round(
        brier_score_loss(y_test, probs), 4
    ))
    print("Log loss:", round(
        log_loss(y_test, probs, labels=[0, 1]), 4
    ))
    print("ROC-AUC:", round(
        roc_auc_score(y_test, probs), 4
    ))

report("Original model", raw_probs)
report("Sigmoid calibrated model", cal_probs)
report("Training-prevalence baseline", baseline_probs)

# Save separately; preserve the existing baseline file.
output = ROOT / "ai_ml" / "models" / "diabetes_calibrated.joblib"
joblib.dump(calibrated_model, output)

print("\nCalibrated model saved to:", output)
print("Research only; not clinically validated.")
