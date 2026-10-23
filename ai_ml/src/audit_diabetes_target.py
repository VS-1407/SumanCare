
from pathlib import Path
import pandas as pd

path = (
    Path(__file__).resolve().parents[1]
    / "data" / "processed" / "nhanes_merged_audit.csv"
)
df = pd.read_csv(path)

print("DIQ010 counts:")
print(df["DIQ010"].value_counts(dropna=False).sort_index())

# Primary binary target:
# 1 = doctor-diagnosed diabetes
# 0 = no doctor-diagnosed diabetes
eligible = df[df["DIQ010"].isin([1, 2])].copy()
eligible["diabetes_target"] = (eligible["DIQ010"] == 1).astype(int)

print("\nEligible participants:", len(eligible))
print("Positive cases:", int(eligible["diabetes_target"].sum()))
print("Negative cases:", int((eligible["diabetes_target"] == 0).sum()))
print("Positive proportion:", round(eligible["diabetes_target"].mean(), 4))

print("\nAge range:")
print(eligible["RIDAGEYR"].describe())

print("\nTarget counts by age:")
print(
    eligible.groupby("diabetes_target")["RIDAGEYR"]
    .agg(["count", "min", "median", "max"])
)

print("\nAudit only: no model trained and no files changed.")
