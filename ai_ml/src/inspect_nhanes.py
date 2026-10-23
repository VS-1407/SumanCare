
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

files = [
    "DEMO_L.xpt",
    "DIQ_L.xpt",
    "GHB_L.xpt",
    "GLU_L.xpt",
    "BMX_L.xpt",
    "BPXO_L.xpt",
]

datasets = {}

for filename in files:
    path = DATA_DIR / filename

    if not path.exists():
        print(f"\nMISSING FILE: {filename}")
        continue

    df = pd.read_sas(path, format="xport")
    datasets[filename] = df

    print(f"\n{'=' * 50}")
    print(f"FILE: {filename}")
    print(f"Rows: {len(df):,} | Columns: {len(df.columns)}")
    print("Columns:", df.columns.tolist())

    if "SEQN" in df.columns:
        print("Unique participant IDs:", df["SEQN"].nunique())
        print("Missing participant IDs:", df["SEQN"].isna().sum())
        print("Duplicate participant IDs:", df["SEQN"].duplicated().sum())

    if filename == "DIQ_L.xpt":
        for col in ["DIQ010", "DIQ160"]:
            if col in df.columns:
                print(f"\n{col} response counts:")
                print(df[col].value_counts(dropna=False).sort_index())

print("\nInspection complete. No files were modified.")
