import numpy as np
from utils.sign import gen_key_pairs
from utils.genhash import get_hash_simple
from utils.sign import gen_key_pairs, sign
from utils.my_io import save_dict_to_toml, generate_data_file
from shared import data_folder_path, circuits_path
import codecs

# This script generates Prover.toml and data.nr for the circuit that computes the hash and provenance of a message

noir_circuit_path = circuits_path / "provenance"

DATA_SIZE = 3  # length of data array

# Generate some data
data = np.random.randint(0, 50, size=DATA_SIZE)

data = np.array([6, 38, 3])

# Compute hash only of individuals_int for simplicity (related to noir bug)
data_hash = get_hash_simple(data)

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
        "statement": {"value": 1},
    },
    "private": {
        "provenance": {
            "signature": data_signature,
            "hash": data_hash_bytes,
        },
        "data": {
            "d1": data.tolist(),
        },
    },
}

comments = f"d1 size = {DATA_SIZE}\ndata size = {DATA_SIZE}\n"

save_dict_to_toml(data, noir_circuit_path / "Prover.toml", comments=comments)


# Generating the data structures
config = {
    "data_sizes": [DATA_SIZE],
    "data_formats": ["u8"],
    "data_comments": ["random data"],
}

generate_data_file(config=config, file_path=noir_circuit_path / "src" / "data.nr")
