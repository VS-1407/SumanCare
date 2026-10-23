import pandas as pd

path = "ai_ml/data/raw/cdc_diabetes_health_indicators.csv"
df = pd.read_csv(path)

target = "Diabetes_binary"
features = [c for c in df.columns if c != target]

# Group rows by their input features, excluding the target label.
groups = df.groupby(features, dropna=False)[target].agg(
    rows="size",
    distinct_labels="nunique"
)

print("===== FEATURE COMBINATION ANALYSIS =====")
print("Total records:", len(df))
print("Unique feature combinations:", len(groups))
print("Feature combinations repeated:", int((groups["rows"] > 1).sum()))
print("Combinations with conflicting labels:",
      int((groups["distinct_labels"] > 1).sum()))

print("\n===== CONFLICTING COMBINATIONS =====")
conflicts = groups[groups["distinct_labels"] > 1]
print("Records in conflicting groups:", int(conflicts["rows"].sum()))
print("Largest conflicting group size:",
      int(conflicts["rows"].max()) if len(conflicts) else 0)

print("\n===== DUPLICATE COUNTS BY TARGET =====")
print(df.loc[df.duplicated(), target].value_counts().sort_index())

print("\nAnalysis complete. No files were modified.")
