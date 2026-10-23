
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    balanced_accuracy_score,
    classification_report,
    brier_score_loss,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"
OUT = BASE / "models" / "nhanes_diabetes_demographics.joblib"

df = pd.read_csv(DATA)

# Adult participants with clear Yes/No questionnaire responses
df = df[
    df["RIDAGEYR"].ge(18)
    & df["DIQ010"].isin([1, 2])
].copy()

df["target"] = (df["DIQ010"] == 1).astype(int)

numeric_features = ["RIDAGEYR", "INDFMPIR"]
categorical_features = ["RIAGENDR", "RIDRETH3", "DMDEDUC2"]
features = numeric_features + categorical_features

X = df[features]
y = df["target"]

# Split before fitting any preprocessing
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features),
])

model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
    )),
])

model.fit(X_train, y_train)

probabilities = model.predict_proba(X_test)[:, 1]
predictions = (probabilities >= 0.5).astype(int)

print("Research baseline: self-reported diagnosed diabetes")
print("Train participants:", len(X_train))
print("Test participants:", len(X_test))
print("Test positive prevalence:", round(y_test.mean(), 4))
print("ROC-AUC:", round(roc_auc_score(y_test, probabilities), 4))
print("PR-AUC (average precision):",
      round(average_precision_score(y_test, probabilities), 4))
print("Brier score:", round(brier_score_loss(y_test, probabilities), 4))
print("Balanced accuracy:",
      round(balanced_accuracy_score(y_test, predictions), 4))
print("\nClassification report:")
print(classification_report(y_test, predictions, zero_division=0))

OUT.parent.mkdir(parents=True, exist_ok=True)
import joblib
joblib.dump(model, OUT)
print("\nSaved model:", OUT)
print("Research use only; not clinically validated.")
