
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
OUT_DIR = DATA_DIR.parent / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

files = {
    "DEMO": "DEMO_L.xpt",
    "DIQ": "DIQ_L.xpt",
    "GHB": "GHB_L.xpt",
    "GLU": "GLU_L.xpt",
    "BMX": "BMX_L.xpt",
    "BPXO": "BPXO_L.xpt",
}

data = {}
for name, filename in files.items():
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    data[name] = pd.read_sas(path, format="xport")

# Verify IDs before merging
for name, df in data.items():
    if df["SEQN"].isna().any() or df["SEQN"].duplicated().any():
        raise ValueError(f"{name}: missing or duplicate SEQN found")

# Keep all demographic participants
merged = data["DEMO"].copy()

for name in ["DIQ", "GHB", "GLU", "BMX", "BPXO"]:
    before = len(merged)
    merged = merged.merge(
        data[name],
        on="SEQN",
        how="left",
        validate="one_to_one",
        indicator="_match",
    )
    matched = (merged["_match"] == "both").sum()
    print(f"{name}: matched {matched:,} / {before:,} participants")
    merged = merged.drop(columns="_match")

print("\nMerged dataset")
print("Rows:", len(merged))
print("Columns:", len(merged.columns))
print("\nMissing values in key fields:")
for col in ["DIQ010", "DIQ160", "LBXGH", "LBXGLU", "BMXBMI",
            "BPXOSY1", "BPXODI1"]:
    if col in merged.columns:
        print(f"{col}: {merged[col].isna().sum():,} missing")

output = OUT_DIR / "nhanes_merged_audit.csv"
merged.to_csv(output, index=False)
print(f"\nSaved audit dataset: {output}")
print("This is an intermediate merged dataset, not training-ready.")
