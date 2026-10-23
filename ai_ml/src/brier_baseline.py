
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import brier_score_loss

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ai_ml" / "data" / "raw" / "cdc_diabetes_health_indicators.csv"
MODELS_DIR = ROOT / "ai_ml" / "models"

df = pd.read_csv(DATA_PATH)
X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

groups = pd.util.hash_pandas_object(X, index=False)

splitter = GroupShuffleSplit(
    n_splits=1, test_size=0.20, random_state=42
)
train_idx, test_idx = next(
    splitter.split(X, y, groups=groups)
)

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

baseline_probability = y_train.mean()
baseline_probs = [baseline_probability] * len(y_test)

print(f"Training prevalence: {baseline_probability:.4f}")
print(f"Test prevalence:     {y_test.mean():.4f}")
print(f"Prevalence baseline Brier: {brier_score_loss(y_test, baseline_probs):.4f}")

for filename in [
    "diabetes_baseline.joblib",
    "diabetes_calibrated.joblib",
]:
    path = MODELS_DIR / filename

    if not path.exists():
        print(f"\n{filename}: model file not found")
        continue

    model = joblib.load(path)
    probabilities = model.predict_proba(X_test)[:, 1]
    score = brier_score_loss(y_test, probabilities)

    print(f"\n{filename}")
    print(f"Brier score: {score:.4f}")
    print(
        "Better than prevalence baseline:",
        score < brier_score_loss(y_test, baseline_probs),
    )

print("\nResearch evaluation only; not clinical validation.")
