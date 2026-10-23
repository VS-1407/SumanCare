from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

DATA = Path("ai_ml/data/raw/cdc_diabetes_health_indicators.csv")
OUT = Path("ai_ml/data/processed")
OUT.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA)
target = "Diabetes_binary"

sns.set_theme(style="whitegrid")

# 1. Target distribution
counts = df[target].value_counts().sort_index()
ax = counts.plot(kind="bar", rot=0)
ax.set_title("Diabetes Target Distribution")
ax.set_xlabel("Target (0 = No, 1 = Yes)")
ax.set_ylabel("Number of records")
plt.tight_layout()
plt.savefig(OUT / "target_distribution.png", dpi=150)
plt.close()

# 2. Diabetes rate by high blood pressure
rates = df.groupby("HighBP")[target].mean() * 100
ax = rates.plot(kind="bar", rot=0)
ax.set_title("Diabetes Label Rate by High Blood Pressure")
ax.set_xlabel("HighBP (0 = No, 1 = Yes)")
ax.set_ylabel("Percentage with target = 1")
plt.tight_layout()
plt.savefig(OUT / "diabetes_by_highbp.png", dpi=150)
plt.close()

# 3. BMI distribution by target
sns.boxplot(data=df, x=target, y="BMI")
plt.title("BMI Distribution by Diabetes Label")
plt.xlabel("Target (0 = No, 1 = Yes)")
plt.tight_layout()
plt.savefig(OUT / "bmi_by_diabetes.png", dpi=150)
plt.close()

print("EDA charts saved to:", OUT.resolve())
print("\nDiabetes label rate by HighBP (%):")
print(rates.round(2).to_string())
print("\nMedian BMI by target:")
print(df.groupby(target)["BMI"].median().to_string())
