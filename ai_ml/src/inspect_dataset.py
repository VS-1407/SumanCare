from pathlib import Path
import pandas as pd

DATA_PATH = Path("ai_ml/data/raw/cdc_diabetes_health_indicators.csv")

df = pd.read_csv(DATA_PATH)
target = "Diabetes_binary"

print("\n===== DATASET OVERVIEW =====")
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())

print("\n===== DATA TYPES =====")
print(df.dtypes.to_string())

print("\n===== MISSING VALUES =====")
print(df.isnull().sum().to_string())
print("Total missing values:", int(df.isnull().sum().sum()))

print("\n===== DUPLICATE ROWS =====")
print("Duplicate rows:", int(df.duplicated().sum()))

print("\n===== TARGET DISTRIBUTION =====")
counts = df[target].value_counts(dropna=False).sort_index()
print(counts.to_string())
print("\nTarget percentages:")
print((df[target].value_counts(normalize=True, dropna=False)
       .sort_index() * 100).round(2).to_string())

print("\n===== NUMERIC SUMMARY =====")
print(df.describe().T.to_string())

print("\n===== UNIQUE VALUES PER COLUMN =====")
print(df.nunique().to_string())
