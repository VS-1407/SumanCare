
from pathlib import Path
import pandas as pd

path = (
    Path(__file__).resolve().parents[1]
    / "data" / "processed" / "nhanes_merged_audit.csv"
)
df = pd.read_csv(path)

features = [
    "RIDAGEYR", "INDFMPIR", "RIAGENDR",
    "RIDRETH3", "DMDEDUC2", "BMXBMI"
]

eligible = df.loc[
    (df["RIDAGEYR"] >= 18) & df["DIQ010"].isin([1, 2])
].copy()

eligible["diabetes_target"] = (eligible["DIQ010"] == 1).astype(int)

# dropna=False keeps groups containing missing feature values.
grouped = eligible.groupby(features, dropna=False)

eligible["group_size"] = grouped["diabetes_target"].transform("size")
eligible["label_count"] = grouped["diabetes_target"].transform("nunique")

conflicts = eligible.loc[
    (eligible["group_size"] > 1) &
    (eligible["label_count"] > 1)
].sort_values(features, na_position="last")

print("===== CONFLICT INSPECTION =====")
print("Eligible adults:", len(eligible))
print("Rows in conflicting combinations:", len(conflicts))
print(
    "Distinct conflicting feature combinations:",
    conflicts[features].drop_duplicates().shape[0]
)

print("\n===== EXAMPLE CONFLICTS =====")
columns = ["SEQN"] + features + ["DIQ010", "diabetes_target"]
print(conflicts[columns].head(30).to_string(index=False))

print("\nInspection only. No data or models modified.")

print("\n===== MISSING VALUES IN CONFLICTING ROWS =====")
print(
    conflicts[features]
    .isna()
    .sum()
    .sort_values(ascending=False)
)

print("\n===== MISSINGNESS SUMMARY =====")
print("Total conflicting rows:", len(conflicts))

print(
    "Rows with at least one missing feature:",
    int(conflicts[features].isna().any(axis=1).sum())
)

print(
    "Rows with all selected features present:",
    int(conflicts[features].notna().all(axis=1).sum())
)

print("\nInspection only. No data or models modified.")
