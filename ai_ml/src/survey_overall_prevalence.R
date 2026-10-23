
library(survey)

input_file <- "D:/SumanCare/ai_ml/data/processed/nhanes_merged_audit.csv"
output_dir <- "D:/SumanCare/ai_ml/reports"

df <- read.csv(input_file, na.strings = c("", "NA"))

required <- c(
  "RIDAGEYR", "DIQ010", "WTINT2YR", "SDMVSTRA", "SDMVPSU"
)

missing_cols <- setdiff(required, names(df))
if (length(missing_cols) > 0) {
  stop("Missing columns: ", paste(missing_cols, collapse = ", "))
}

# Adults with valid Yes/No self-reported diabetes response
df <- subset(df, RIDAGEYR >= 18 & DIQ010 %in% c(1, 2))
df$diabetes <- as.integer(df$DIQ010 == 1)

# Keep valid interview weights and survey design fields
df <- subset(
  df,
  !is.na(WTINT2YR) & WTINT2YR > 0 &
  !is.na(SDMVSTRA) & !is.na(SDMVPSU)
)

# Interview-weighted estimate
des <- svydesign(
  ids = ~SDMVPSU,
  strata = ~SDMVSTRA,
  weights = ~WTINT2YR,
  nest = TRUE,
  data = df
)

estimate <- svymean(~diabetes, design = des)
ci <- confint(estimate)

result <- data.frame(
  measure = "Self-reported doctor-diagnosed diabetes",
  eligible_adults_n = nrow(df),
  unweighted_prevalence = mean(df$diabetes),
  interview_weighted_prevalence = as.numeric(coef(estimate)[1]),
  standard_error = as.numeric(SE(estimate)[1]),
  ci_lower = as.numeric(ci[1, 1]),
  ci_upper = as.numeric(ci[1, 2])
)

print(result)

dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
write.csv(
  result,
  file.path(output_dir, "survey_overall_prevalence_ci.csv"),
  row.names = FALSE
)
