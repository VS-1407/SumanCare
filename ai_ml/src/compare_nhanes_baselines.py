
from pathlib import Path

import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
)

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
MODEL_PATH = BASE / "models" / "nhanes_diabetes_demographics.joblib"

df = pd.read_csv(DATA)
df = df[
    df["RIDAGEYR"].ge(18)
    & df["DIQ010"].isin([1, 2])
].copy()

y = (df["DIQ010"] == 1).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    df[["RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3", "DMDEDUC2"]],
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

# Age-only logistic regression
age_model = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
    )),
])

age_model.fit(X_train[["RIDAGEYR"]], y_train)
age_prob = age_model.predict_proba(X_test[["RIDAGEYR"]])[:, 1]

# Existing demographics model
full_model = joblib.load(MODEL_PATH)
full_prob = full_model.predict_proba(X_test)[:, 1]

# Constant prevalence prediction
prevalence = float(y_train.mean())
prevalence_prob = np.full(len(y_test), prevalence)

results = {
    "Training prevalence baseline": prevalence_prob,
    "Age-only logistic regression": age_prob,
    "Full demographics model": full_prob,
}

print("Same test split for all comparisons")
print("Test participants:", len(y_test))
print("Test prevalence:", round(y_test.mean(), 4))
print()

for name, prob in results.items():
    print(name)
    print("  ROC-AUC:", round(roc_auc_score(y_test, prob), 4))
    print("  PR-AUC:", round(average_precision_score(y_test, prob), 4))
    print("  Brier score:", round(brier_score_loss(y_test, prob), 4))
    print()

print("Comparison complete. Existing model was not modified.")
