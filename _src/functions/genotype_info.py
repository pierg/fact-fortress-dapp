from ast import main
import json
import numpy as np
from shared import data_folder_path

# Input:  patients genetics data at specific SNPs locations
# Output: average risk factor among all patients for cardiovascular problems

# Load the data from the JSON file
with open(data_folder_path / "snps_data.json") as f:
    data = json.load(f)


# function to retrieve the genotype of a patient for a given SNP
def get_genotype(patient_id, snp):
    try:
        genotype = data["private_data"]["auth_a"]["data"][patient_id]["genetic_data"][snp]
    except KeyError:
        genotype = data["private_data"]["auth_b"]["data"][patient_id]["genetic_data"][snp]
    return genotype


def percentage_people_with(data, position, value):
    ag_count = 0
    total_count = 0
    for patient_id in data["private_data"]["auth_a"]["data"]:
        if position in data["private_data"]["auth_a"]["data"][patient_id]["genetic_data"]:
            total_count += 1
            if data["private_data"]["auth_a"]["data"][patient_id]["genetic_data"][position] == value:
                ag_count += 1
    for patient_id in data["private_data"]["auth_b"]["data"]:
        if position in data["private_data"]["auth_b"]["data"][patient_id]["genetic_data"]:
            total_count += 1
            if data["private_data"]["auth_b"]["data"][patient_id]["genetic_data"][position] == value:
                ag_count += 1
    percentage = ag_count / total_count * 100 if total_count > 0 else 0
    return percentage


if __name__ == "__main__":
    position = "rs10757274"
    value = "GG"
    percentage = percentage_people_with(data, position, value)
    print(f"The percentage of people having {value} in position {position} is {percentage}%")
