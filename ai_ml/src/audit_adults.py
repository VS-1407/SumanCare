
from pathlib import Path
import pandas as pd

path = (
    Path(__file__).resolve().parents[1]
    / "data" / "processed" / "nhanes_merged_audit.csv"
)
df = pd.read_csv(path)

# Keep only clear Yes/No questionnaire responses and adults
adults = df[
    df["DIQ010"].isin([1, 2]) &
    (df["RIDAGEYR"] >= 18)
].copy()

adults["diabetes_target"] = (
    adults["DIQ010"] == 1
).astype(int)

print("Adult eligible participants:", len(adults))
print("\nTarget counts:")
print(adults["diabetes_target"].value_counts().sort_index())

print("\nPositive proportion:",
      round(adults["diabetes_target"].mean(), 4))

print("\nAge by target:")
print(
    adults.groupby("diabetes_target")["RIDAGEYR"]
    .agg(["count", "mean", "median", "min", "max"])
)

print("\nMissing values in candidate predictors:")
features = [
    "RIAGENDR", "RIDRETH3", "DMDEDUC2", "INDFMPIR",
    "BMXBMI", "BPXOSY1", "BPXODI1"
]
print(adults[features].isna().sum())

print("\nAudit complete. No model trained.")
