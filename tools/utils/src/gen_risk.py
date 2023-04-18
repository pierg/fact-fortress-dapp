import numpy as np
from utils.sign import gen_key_pairs
from utils.genhash import get_hash_simple
from utils.sign import gen_key_pairs, sign
from utils.my_io import save_dict_to_toml, generate_data_file
from shared import data_folder_path, circuits_path
import codecs

# This script generates Prover.toml and data.nr for the circuit that computes the risk scores of individuals

noir_circuit_path = circuits_path / "risk"

N_POSITIONS = 3  # number of positions in each individual's array
N_INDIVIDUALS = 2  # number of individuals in the list
DECIMAL_PRECISION = 10


# Generate individuals
individuals = np.random.randint(0, 3, size=(N_INDIVIDUALS, N_POSITIONS))

# Generate beta values
betas = np.abs(np.random.normal(0, 1, size=N_POSITIONS))

# Example of how to compute risk scores for each individual
risk_scores = []
for i in range(N_INDIVIDUALS):
    individual = individuals[i]
    risk_score = np.dot(individual, betas)
    risk_scores.append(risk_score)

# Average of scores approximated to integer
result = round(np.mean(risk_scores) * DECIMAL_PRECISION)

# Approximate beta values with integers with three decimal points precision
betas_int = np.around(betas * DECIMAL_PRECISION).astype(int).tolist()

# Compute individuals_int
individuals_int = np.ravel(individuals).astype(int).tolist()

# Compute hash only of individuals_int for simplicity (related to noir bug)
data_hash = get_hash_simple(individuals_int)

# Generate key-pairs
priv_key, pub_key = gen_key_pairs()

# Convert the public key into its `x` and `y` points
pub_key_bytes = codecs.decode(pub_key[2:], "hex_codec")
pub_key_x = "0x" + "".join("{:02x}".format(x) for x in pub_key_bytes[0:32])
pub_key_y = "0x" + "".join("{:02x}".format(x) for x in pub_key_bytes[32:64])

# Sign private_data
data_signature = sign(data_hash, priv_key)

# convert hash into bytes for the circuit
data_hash_bytes = codecs.decode(data_hash, "hex_codec")

# Save individuals and betas to a TOML file
data = {
    "public": {
        "keys": {"pub_key_x": pub_key_x, "pub_key_y": pub_key_y},
        "statement": {"value": result},
    },
    "private": {
        "provenance": {
            "signature": data_signature,
            "hash": data_hash_bytes,
        },
        "data": {
            "d1": individuals_int,
            "d2": betas_int,
        },
    },
}

comments = f"d1 size = {N_INDIVIDUALS * N_POSITIONS}\nd2 size = {N_POSITIONS}\ndata size = {(N_INDIVIDUALS * N_POSITIONS) + N_POSITIONS}\ndecimal precision = {DECIMAL_PRECISION}"

save_dict_to_toml(data, noir_circuit_path / "Prover.toml", comments=comments)


# Generating the data structures
config = {
    "data_sizes": [N_INDIVIDUALS * N_POSITIONS, N_POSITIONS],
    "data_formats": ["u2", "u16"],
    "data_comments": ["individuals", "betas"],
    "precision": 10,
    "sum_size": 8,
    "population_size": N_INDIVIDUALS,
}

generate_data_file(config=config, file_path=noir_circuit_path / "src" / "data.nr")
