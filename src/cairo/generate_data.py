import json
import random

from starkware.crypto.signature.signature import (
    pedersen_hash,
    private_to_stark_key,
    sign,
)


PERSON_ID = 10018

authorities = ["hospital", "dna_company", "23_and_me"]

# Generate key pairs of the authorities that can certify medical results.
priv_keys = {}
pub_keys = {}

for authority in authorities:
    seed = random.randint(1, 10000)  # Generate a new random seed at each iteration.
    priv_key = 123456 * seed + 654321
    priv_keys[authority] = priv_key
    pub_key = private_to_stark_key(priv_key)
    pub_keys[authority] = pub_key

# Generate 3 records of recordrs 3, 5, and 8.
records = []
for (authority, record) in [("hospital", 1), ("dna_company", 1), ("23_and_me", 0)]:
    r, s = sign(
        msg_hash=pedersen_hash(PERSON_ID, record), priv_key=priv_keys[authority]
    )
    records.append(
        {
            "authority": authority.encode("utf-8").hex(),
            "record": record,
            "r": hex(r),
            "s": hex(s),
        }
    )

# Write the data (public keys and records) to a JSON file.
input_data = {
    "public_keys": list(map(hex, pub_keys.values())),
    "records": records,
}

with open("data_input.json", "w") as f:
    json.dump(input_data, f, indent=4)
    f.write("\n")
