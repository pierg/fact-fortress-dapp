import random
import numpy as np
from utils.hash_and_sign import get_hash
from utils.my_io import save_dict_to_json, save_dict_to_toml
from shared import data_folder_path
import base64


N_POSITIONS = 2  # number of positions in each individual's array
N_INDIVIDUALS = 2  # number of individuals in the list
DECIMAL_PRECISION = 10


# Generate individuals
individuals = np.random.randint(0, 3, size=(N_INDIVIDUALS, N_POSITIONS))

# Generate beta values
betas = np.abs(np.random.normal(0, 1, size=N_POSITIONS))

# Approximate beta values with integers with three decimal points precision
betas_int = np.around(betas * DECIMAL_PRECISION).astype(int).tolist()

# Compute individuals_int
individuals_int = np.ravel(individuals).astype(int).tolist()

data_hash = get_hash([list(individuals_int), list(betas_int)])

# Save individuals and betas to a TOML file
data = {
    "n_positions": N_POSITIONS,
    "n_indivisuals": N_INDIVIDUALS,
    "precision": DECIMAL_PRECISION,
    "individuals": list(individuals_int),
    "betas": list(betas_int),
    "hash": data_hash,
}


save_dict_to_json(data, data_folder_path / "risk_score.json")
save_dict_to_toml(data, data_folder_path / "risk_score.toml")


# Compute risk scores for each individual
risk_scores = []
for i in range(N_INDIVIDUALS):
    individual = individuals[i]
    risk_score = np.dot(individual, betas)
    risk_scores.append(risk_score)

print("Risk scores:")
print(risk_scores)
