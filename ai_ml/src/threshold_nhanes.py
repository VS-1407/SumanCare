
from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    confusion_matrix,
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
MODEL = BASE / "models" / "nhanes_diabetes_demographics.joblib"

df = pd.read_csv(DATA)
df = df[
    df["RIDAGEYR"].ge(18)
    & df["DIQ010"].isin([1, 2])
].copy()

y = (df["DIQ010"] == 1).astype(int)
X = df[["RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3", "DMDEDUC2"]]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

model = joblib.load(MODEL)
prob = model.predict_proba(X_test)[:, 1]

print("Threshold | Precision | Recall | F1 | Balanced Acc | TN FP FN TP")
for threshold in [0.20, 0.30, 0.40, 0.50, 0.60, 0.70]:
    pred = (prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(
        y_test, pred, labels=[0, 1]
    ).ravel()

    print(
        f"{threshold:.2f} | "
        f"{precision_score(y_test, pred, zero_division=0):.3f} | "
        f"{recall_score(y_test, pred, zero_division=0):.3f} | "
        f"{f1_score(y_test, pred, zero_division=0):.3f} | "
        f"{balanced_accuracy_score(y_test, pred):.3f} | "
        f"{tn} {fp} {fn} {tp}"
    )

print("\nResearch analysis only; thresholds are not clinical recommendations.")
