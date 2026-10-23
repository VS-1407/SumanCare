
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

print("Participants:", len(cohort))
print("Missing MEC weights:", cohort["WTMEC2YR"].isna().sum())
print("Missing strata:", cohort["SDMVSTRA"].isna().sum())
print("Missing PSU:", cohort["SDMVPSU"].isna().sum())
print("Unique strata:", cohort["SDMVSTRA"].nunique())
print("Unique PSU labels:", cohort["SDMVPSU"].nunique())
print("Unique stratum-PSU pairs:",
      cohort[["SDMVSTRA", "SDMVPSU"]].drop_duplicates().shape[0])

print("\nWeight sum:", round(cohort["WTMEC2YR"].sum(), 2))
print("Weighted positive fraction:",
      round(
          (cohort["WTMEC2YR"] * (cohort["DIQ010"] == 1)).sum()
          / cohort["WTMEC2YR"].sum(),
          4,
      ))

print("\nDesign-field check complete; no model modified.")
