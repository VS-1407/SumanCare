
from pathlib import Path
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.weightstats import DescrStatsW

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

cohort["target"] = (cohort["DIQ010"] == 1).astype(int)

# Weighted point estimate only; do not treat this as
# a survey-design confidence interval.
weighted_prevalence = (
    (cohort["WTMEC2YR"] * cohort["target"]).sum()
    / cohort["WTMEC2YR"].sum()
)

print("Complete-case participants:", len(cohort))
print("Unweighted prevalence:", round(cohort["target"].mean(), 4))
print("MEC-weighted prevalence:", round(weighted_prevalence, 4))
print("Strata:", cohort["SDMVSTRA"].nunique())
print("Stratum-PSU pairs:",
      cohort[["SDMVSTRA", "SDMVPSU"]].drop_duplicates().shape[0])
print("\nPoint estimate only. No design-based CI calculated.")
