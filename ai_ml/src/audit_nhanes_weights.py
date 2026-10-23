
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"

df = pd.read_csv(DATA)

df["systolic_mean"] = df[
    ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
].mean(axis=1)

df["diastolic_mean"] = df[
    ["BPXODI1", "BPXODI2", "BPXODI3"]
].mean(axis=1)

features = [
    "RIDAGEYR", "INDFMPIR", "BMXBMI",
    "systolic_mean", "diastolic_mean",
    "RIAGENDR", "RIDRETH3", "DMDEDUC2",
]

cohort = df[
    df["RIDAGEYR"].ge(18) & df["DIQ010"].isin([1, 2])
].dropna(subset=features + ["DIQ010"]).copy()

print("Complete-case cohort:", len(cohort))
print("\nWeight and survey-design fields:")

for col in ["WTMEC2YR", "SDMVSTRA", "SDMVPSU"]:
    print(f"\n{col}")
    print("Missing:", cohort[col].isna().sum())
    print("Unique values:", cohort[col].nunique())
    if col == "WTMEC2YR":
        print(cohort[col].describe())
        print("Zero or negative weights:", (cohort[col] <= 0).sum())

print("\nParticipants by target:")
cohort["target"] = (cohort["DIQ010"] == 1).astype(int)
print(cohort.groupby("target").size())

print("\nWeight summary by target:")
print(cohort.groupby("target")["WTMEC2YR"].describe().round(2))

print("\nAudit complete. No model trained or modified.")
