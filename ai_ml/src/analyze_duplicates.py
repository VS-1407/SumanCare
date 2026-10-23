from pathlib import Path
import pandas as pd

path = Path("ai_ml/data/raw/cdc_diabetes_health_indicators.csv")
df = pd.read_csv(path)

target = "Diabetes_binary"

print("===== ORIGINAL DATA =====")
print("Rows:", len(df))
print("Exact duplicate rows:", int(df.duplicated().sum()))

print("\n===== TARGET COUNTS: ORIGINAL =====")
print(df[target].value_counts().sort_index())

print("\n===== TARGET PERCENTAGES: ORIGINAL =====")
print((df[target].value_counts(normalize=True).sort_index() * 100).round(2))

# Analysis only: do not overwrite the original file.
dedup = df.drop_duplicates().copy()

print("\n===== AFTER EXACT DEDUPLICATION =====")
print("Rows:", len(dedup))
print("Rows removed:", len(df) - len(dedup))
print("Remaining duplicate rows:", int(dedup.duplicated().sum()))

print("\n===== TARGET COUNTS: DEDUPLICATED =====")
print(dedup[target].value_counts().sort_index())

print("\n===== TARGET PERCENTAGES: DEDUPLICATED =====")
print((dedup[target].value_counts(normalize=True).sort_index() * 100).round(2))

print("\n===== LABEL CONFLICT CHECK =====")
features = [c for c in df.columns if c != target]
label_counts = df.groupby(features, dropna=False)[target].nunique()
print("Identical feature combinations with conflicting labels:",
      int((label_counts > 1).sum()))

print("\nAnalysis complete. Original CSV was not changed.")
