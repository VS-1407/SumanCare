
from pathlib import Path

import pandas as pd
import joblib
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ai_ml" / "data" / "raw" / "cdc_diabetes_health_indicators.csv"
MODEL_PATH = ROOT / "ai_ml" / "models" / "diabetes_baseline.joblib"
OUTPUT_DIR = ROOT / "ai_ml" / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

model = joblib.load(MODEL_PATH)
classifier = model.named_steps["classifier"]

# Logistic regression coefficients are on standardized features.
coefficients = pd.DataFrame({
    "feature": X.columns,
    "coefficient": classifier.coef_[0],
})

coefficients["absolute_coefficient"] = (
    coefficients["coefficient"].abs()
)

coefficients = coefficients.sort_values(
    "absolute_coefficient", ascending=False
)

print("Largest standardized logistic-regression coefficients:")
print(
    coefficients[
        ["feature", "coefficient"]
    ].head(10).to_string(index=False)
)

coefficients.to_csv(
    OUTPUT_DIR / "feature_coefficients.csv",
    index=False,
)

top = coefficients.head(12).sort_values("coefficient")

plt.figure(figsize=(9, 6))
plt.barh(top["feature"], top["coefficient"])
plt.axvline(0, linewidth=1)
plt.xlabel("Standardized logistic regression coefficient")
plt.title("Baseline model: largest feature coefficients")
plt.tight_layout()

chart_path = OUTPUT_DIR / "feature_coefficients.png"
plt.savefig(chart_path, dpi=150)
plt.close()

print("\nSaved coefficients to:", OUTPUT_DIR / "feature_coefficients.csv")
print("Saved chart to:", chart_path)
print(
    "\nNote: coefficients describe this fitted model's associations; "
    "they do not prove causation or clinical importance."
)
