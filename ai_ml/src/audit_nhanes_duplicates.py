
from pathlib import Path
import pandas as pd

path = (
    Path(__file__).resolve().parents[1]
    / "data" / "processed" / "nhanes_merged_audit.csv"
)
df = pd.read_csv(path)

print("===== NHANES DUPLICATE AUDIT =====")
print("Total rows:", len(df))

# SEQN uniquely identifies each NHANES participant.
print("\n===== PARTICIPANT ID CHECK =====")
print("Missing SEQN:", int(df["SEQN"].isna().sum()))
print("Duplicate SEQN rows:", int(df["SEQN"].duplicated().sum()))

# Exact duplicate rows across all columns.
print("\n===== EXACT ROW DUPLICATES =====")
print("Exact duplicate rows:", int(df.duplicated().sum()))

# Check duplicate feature patterns in the eligible adult cohort.
eligible = df.loc[
    (df["RIDAGEYR"] >= 18) & df["DIQ010"].isin([1, 2])
].copy()
eligible["diabetes_target"] = (eligible["DIQ010"] == 1).astype(int)

features = [
    "RIDAGEYR", "INDFMPIR", "RIAGENDR",
    "RIDRETH3", "DMDEDUC2", "BMXBMI"
]
features = [c for c in features if c in eligible.columns]

grouped = eligible.groupby(
    features, dropna=False
)["diabetes_target"].agg(
    rows="size",
    distinct_labels="nunique"
)

print("\n===== ELIGIBLE ADULT COHORT =====")
print("Eligible participants:", len(eligible))
print("Repeated feature combinations:", int((grouped["rows"] > 1).sum()))
print(
    "Feature combinations with conflicting labels:",
    int((grouped["distinct_labels"] > 1).sum())
)

print("\nAudit complete. No files modified.")
