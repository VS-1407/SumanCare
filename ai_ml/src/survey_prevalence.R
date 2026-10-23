
# SumanCare: NHANES survey-weighted diabetes prevalence
# Target: self-reported doctor-diagnosed diabetes
# Analysis cohort: adults with complete demographic, BMI and BP data

library(survey)

input_file <- "D:/SumanCare/ai_ml/data/processed/nhanes_merged_audit.csv"
output_dir <- "D:/SumanCare/ai_ml/reports"

dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

df <- read.csv(input_file, na.strings = c("", "NA"))

# Check required variables before analysis
required <- c(
  "RIDAGEYR", "DIQ010", "BMXBMI",
  "WTMEC2YR", "SDMVSTRA", "SDMVPSU",
  "BPXOSY1", "BPXOSY2", "BPXOSY3",
  "BPXODI1", "BPXODI2", "BPXODI3"
)

missing_cols <- setdiff(required, names(df))
if (length(missing_cols) > 0) {
  stop("Missing columns: ", paste(missing_cols, collapse = ", "))
}

# Primary outcome: DIQ010 1 = Yes, 2 = No
# Keep adults and valid Yes/No responses only.
df <- subset(df, RIDAGEYR >= 18 & DIQ010 %in% c(1, 2))
df$diabetes <- ifelse(df$DIQ010 == 1, 1, 0)

# Recreate average BP using available readings.
sys_cols <- c("BPXOSY1", "BPXOSY2", "BPXOSY3")
dia_cols <- c("BPXODI1", "BPXODI2", "BPXODI3")

row_mean <- function(x) {
  n <- rowSums(!is.na(x))
  result <- rowMeans(x, na.rm = TRUE)
  result[n == 0] <- NA_real_
  result
}

df$mean_systolic <- row_mean(df[sys_cols])
df$mean_diastolic <- row_mean(df[dia_cols])

# Same complete-case features as the health-features model:
# demographic predictors + BMI + systolic and diastolic BP.
features <- c(
  "RIDAGEYR", "INDFMPIR", "RIAGENDR", "RIDRETH3",
  "DMDEDUC2", "BMXBMI", "mean_systolic", "mean_diastolic"
)

if (!"INDFMPIR" %in% names(df) ||
    !"RIAGENDR" %in% names(df) ||
    !"RIDRETH3" %in% names(df) ||
    !"DMDEDUC2" %in% names(df)) {
  stop("One or more demographic predictor columns are missing.")
}

keep <- complete.cases(df[, c(
  "diabetes", features, "WTMEC2YR", "SDMVSTRA", "SDMVPSU"
)]) & df$WTMEC2YR > 0

cc <- df[keep, ]

if (nrow(cc) == 0) stop("No complete-case rows remain.")

# NHANES complex survey design
des <- svydesign(
  ids = ~SDMVPSU,
  strata = ~SDMVSTRA,
  weights = ~WTMEC2YR,
  nest = TRUE,
  data = cc
)

# Weighted prevalence and design-based 95% CI
estimate <- svymean(~diabetes, design = des, na.rm = TRUE)
ci <- confint(estimate)

result <- data.frame(
  measure = "Self-reported doctor-diagnosed diabetes",
  cohort_n = nrow(cc),
  unweighted_prevalence = mean(cc$diabetes),
  weighted_prevalence = as.numeric(coef(estimate)[1]),
  standard_error = as.numeric(SE(estimate)[1]),
  ci_lower = as.numeric(ci[1, 1]),
  ci_upper = as.numeric(ci[1, 2])
)

print(result)
write.csv(
  result,
  file.path(output_dir, "survey_weighted_prevalence_ci.csv"),
  row.names = FALSE
)

cat("\nSaved report to:", file.path(
  output_dir, "survey_weighted_prevalence_ci.csv"
), "\n")
