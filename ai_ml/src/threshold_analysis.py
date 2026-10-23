
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import (
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    roc_auc_score,
)

ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ai_ml" / "data" / "raw" / "cdc_diabetes_health_indicators.csv"
MODEL_PATH = ROOT / "ai_ml" / "models" / "diabetes_baseline.joblib"
OUTPUT_PATH = ROOT / "ai_ml" / "data" / "processed" / "threshold_analysis.csv"

df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["Diabetes_binary"])
y = df["Diabetes_binary"].astype(int)

# Reproduce the same grouped holdout split used in training
groups = pd.util.hash_pandas_object(X, index=False)

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42,
)
train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_test = X.iloc[test_idx]
y_test = y.iloc[test_idx]

model = joblib.load(MODEL_PATH)
probabilities = model.predict_proba(X_test)[:, 1]

print("ROC-AUC:", round(roc_auc_score(y_test, probabilities), 4))
print("\nThreshold comparison:\n")

results = []

for threshold in [0.20, 0.30, 0.40, 0.50, 0.60, 0.70]:
    predictions = (probabilities >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_test, predictions, labels=[0, 1]
    ).ravel()

    row = {
        "threshold": threshold,
        "precision": precision_score(
            y_test, predictions, zero_division=0
        ),
        "recall": recall_score(
            y_test, predictions, zero_division=0
        ),
        "f1": f1_score(
            y_test, predictions, zero_division=0
        ),
        "balanced_accuracy": balanced_accuracy_score(
            y_test, predictions
        ),
        "true_positives": int(tp),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_negatives": int(tn),
        "predicted_positive_percent": round(
            predictions.mean() * 100, 2
        ),
    }

    results.append(row)

    print(
        f"Threshold: {threshold:.2f} | "
        f"Precision: {row['precision']:.3f} | "
        f"Recall: {row['recall']:.3f} | "
        f"F1: {row['f1']:.3f} | "
        f"Balanced accuracy: {row['balanced_accuracy']:.3f}"
    )
    print(
        f"  TP: {tp} | FP: {fp} | FN: {fn} | TN: {tn}"
    )

pd.DataFrame(results).to_csv(OUTPUT_PATH, index=False)

print("\nResults saved to:", OUTPUT_PATH)
print("Research analysis only; not a clinical threshold.")
