import json
import numpy as np
from shared import data_folder_path

# Input:  patients genetics data at specific SNPs locations
# Output: average risk factor among all patients for cardiovascular problems

# Load the data from the JSON file
with open(data_folder_path / "snps_data.json") as f:
    data = json.load(f)

# Cardiovascular problems risk score coefficients ?
coefficients = {
    "rs10757274": 0.1,
    "rs562556": 0.2,
    "rs429358": 0.3,
    "rs7412": 0.4,
    "rs1801133": 0.5,
}
intercept = -1.0

# Compute the risk score for each patient
risk_scores = []
for company_data in data["private_data"].values():
    for patient_data in company_data["data"].values():
        beta_values = [0.0] * len(coefficients)
        for i, snp in enumerate(coefficients.keys()):
            genotype = patient_data["genetic_data"].get(snp, None)
            """TODO"""
            if genotype == "AA":
                beta_values[i] = 0.0
            elif genotype == "AG":
                beta_values[i] = 1.0
            elif genotype == "GG":
                beta_values[i] = 2.0
            else:
                beta_values[i] = np.nan
        if not np.any(np.isnan(beta_values)):
            risk_score = intercept + np.dot(beta_values, list(coefficients.values()))
            risk_scores.append(risk_score)

# Compute the average risk score across all patients
average_risk_score = np.mean(risk_scores)

print(f"Average risk score: {average_risk_score}")
