
from pathlib import Path

import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    balanced_accuracy_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)

# Project paths
ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ai_ml" / "data" / "raw" / "cdc_diabetes_health_indicators.csv"
OUTPUT_DIR = ROOT / "ai_ml" / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load dataset
df = pd.read_csv(DATA_PATH)

target_column = "Diabetes_binary"
X = df.drop(columns=[target_column])
y = df[target_column].astype(int)

# Keep identical feature combinations in the same split
groups = pd.util.hash_pandas_object(X, index=False)

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42,
)

train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

print("Dataset loaded:", df.shape)
print("Training rows:", len(X_train))
print("Testing rows:", len(X_test))
print("Training positive rate:", round(y_train.mean(), 4))
print("Testing positive rate:", round(y_test.mean(), 4))

# Baseline model
model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
        ),
    ),
])

print("\nTraining model...")
model.fit(X_train, y_train)

# Evaluate on held-out test data
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

print("\n--- BASELINE EVALUATION ---")
print(
    "Balanced accuracy:",
    round(balanced_accuracy_score(y_test, predictions), 4),
)
print("ROC-AUC:", round(roc_auc_score(y_test, probabilities), 4))

print("\nClassification report:")
print(
    classification_report(
        y_test,
        predictions,
        target_names=["No diabetes label", "Diabetes-related label"],
        zero_division=0,
    )
)

print("Confusion matrix:")
print(confusion_matrix(y_test, predictions))

# Save the baseline model
import joblib

model_path = ROOT / "ai_ml" / "models" / "diabetes_baseline.joblib"
model_path.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, model_path)

print("\nModel saved to:", model_path)
print("NOTE: Research baseline only; not clinically validated.")
