from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "processed" / "nhanes_merged_audit.csv"

df = pd.read_csv(DATA)

df = df.loc[
    (df["RIDAGEYR"] >= 18)
    & df["DIQ010"].isin([1, 2])
].copy()

df["target"] = (df["DIQ010"] == 1).astype(int)

sys_cols = ["BPXOSY1", "BPXOSY2", "BPXOSY3"]
dia_cols = ["BPXODI1", "BPXODI2", "BPXODI3"]

df["systolic_mean"] = df[sys_cols].mean(axis=1)
df["diastolic_mean"] = df[dia_cols].mean(axis=1)

features = [
    "RIDAGEYR", "INDFMPIR", "RIAGENDR",
    "RIDRETH3", "DMDEDUC2", "BMXBMI",
    "systolic_mean", "diastolic_mean",
]

df["complete_case"] = df[features].notna().all(axis=1)

print("===== COHORT SELECTION AUDIT =====")

for name, group in [
    ("All eligible adults", df),
    ("Complete-case cohort", df[df["complete_case"]]),
    ("Excluded participants", df[~df["complete_case"]]),
]:
    print(f"\n{name}")
    print("Participants:", len(group))

    if len(group):
        print("Diabetes-positive:", int(group["target"].sum()))
        print("Positive prevalence:", round(group["target"].mean(), 4))

print("\nAudit only. No data or models modified.")

print("\n===== INCLUDED VS EXCLUDED CHARACTERISTICS =====")

compare_cols = [
    "RIDAGEYR",
    "INDFMPIR",
    "BMXBMI",
    "systolic_mean",
    "diastolic_mean",
]

for col in compare_cols:
    print(f"\n{col}")
    print(
        df.groupby("complete_case")[col]
        .agg(["count", "mean", "median"])
        .rename(index={
            False: "Excluded",
            True: "Included"
        })
        .round(2)
    )

print("\nGender distribution (proportion):")
print(
    pd.crosstab(
        df["complete_case"],
        df["RIAGENDR"],
        normalize="index"
    ).round(3).rename(index={
        False: "Excluded",
        True: "Included"
    })
)

print("\nAudit only. No data or models modified.")