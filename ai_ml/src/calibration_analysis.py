from pathlib import Path

import joblib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import GroupShuffleSplit
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss

ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ai_ml" / "data" / "raw" / "cdc_diabetes_health_indicators.csv"
MODEL_PATH = ROOT / "ai_ml" / "models" / "diabetes_baseline.joblib"
OUTPUT_DIR = ROOT / "ai_ml" / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)
X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

# Same grouped test split as training
groups = pd.util.hash_pandas_object(X, index=False)
splitter = GroupShuffleSplit(
    n_splits=1, test_size=0.20, random_state=42
)
train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_test = X.iloc[test_idx]
y_test = y.iloc[test_idx]

model = joblib.load(MODEL_PATH)
probabilities = model.predict_proba(X_test)[:, 1]

brier = brier_score_loss(y_test, probabilities)
print("Brier score:", round(brier, 4))
print("Lower is better, but compare against a prevalence baseline.")

# Calibration table
actual_rate, mean_predicted = calibration_curve(
    y_test,
    probabilities,
    n_bins=10,
    strategy="quantile",
)

calibration_table = pd.DataFrame({
    "mean_predicted_probability": mean_predicted,
    "observed_positive_rate": actual_rate,
})

print("\nCalibration table:")
print(calibration_table.round(4).to_string(index=False))

calibration_table.to_csv(
    OUTPUT_DIR / "calibration_table.csv", index=False
)

plt.figure(figsize=(7, 6))
plt.plot(mean_predicted, actual_rate, marker="o", label="Model")
plt.plot([0, 1], [0, 1], linestyle="--", label="Perfect calibration")
plt.xlabel("Mean predicted probability")
plt.ylabel("Observed positive-label rate")
plt.title("Diabetes baseline calibration")
plt.legend()
plt.tight_layout()

chart_path = OUTPUT_DIR / "calibration_curve.png"
plt.savefig(chart_path, dpi=150)
plt.close()

print("\nSaved chart:", chart_path)
print("Research evaluation only; not clinical validation.")
