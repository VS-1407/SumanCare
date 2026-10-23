
from pathlib import Path

import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import GroupShuffleSplit
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss

ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    ROOT / "ai_ml" / "data" / "raw"
    / "cdc_diabetes_health_indicators.csv"
)
MODEL_PATH = (
    ROOT / "ai_ml" / "models"
    / "diabetes_calibrated.joblib"
)
OUTPUT_DIR = ROOT / "ai_ml" / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

groups = pd.util.hash_pandas_object(X, index=False)

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42,
)
dev_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_test = X.iloc[test_idx]
y_test = y.iloc[test_idx]

model = joblib.load(MODEL_PATH)
probabilities = model.predict_proba(X_test)[:, 1]

observed_rate, mean_probability = calibration_curve(
    y_test,
    probabilities,
    n_bins=10,
    strategy="quantile",
)

table = pd.DataFrame({
    "mean_predicted_probability": mean_probability,
    "observed_positive_rate": observed_rate,
})

print("Test-set Brier score:",
      round(brier_score_loss(y_test, probabilities), 4))
print("\nCalibration table:")
print(table.round(4).to_string(index=False))

table.to_csv(
    OUTPUT_DIR / "calibrated_test_curve.csv",
    index=False,
)

plt.figure(figsize=(7, 6))
plt.plot(
    mean_probability,
    observed_rate,
    marker="o",
    label="Calibrated model",
)
plt.plot(
    [0, 1], [0, 1],
    linestyle="--",
    label="Perfect calibration",
)
plt.xlabel("Mean predicted probability")
plt.ylabel("Observed positive-label rate")
plt.title("Calibrated model: test-set calibration")
plt.legend()
plt.tight_layout()

chart_path = OUTPUT_DIR / "calibrated_test_curve.png"
plt.savefig(chart_path, dpi=150)
plt.close()

print("\nChart saved to:", chart_path)
print("Research evaluation only; not clinical validation.")
