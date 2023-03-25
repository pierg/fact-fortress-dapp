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

for i, authority in enumerate(authorities):
    seed = random.randint(1, 10000)  # Generate a new random seed at each iteration.
    priv_key = 123456 * seed + 654321  # See "Safety note" below.
    priv_keys[authority] = priv_key

    pub_key = private_to_stark_key(priv_key)
    pub_keys[authority] = pub_key

# Generate 3 records
records = []
for i, (authority, record) in enumerate(
    [("hospital", 1), ("dna_company", 1), ("23_and_me", 0)]
):
    r, s = sign(
        msg_hash=pedersen_hash(PERSON_ID, record), priv_key=priv_keys[authority]
    )
    records.append(
        {
            "authority": authority,
            "authority_id": i, # index of the corresponding public hash
            "record": record,
            "r": hex(r),
            "s": hex(s),
        }
    )

# Write the data (public keys and records) to a JSON file.
input_data = {
    "public_keys": pub_keys,
    "records": records,
}

with open("data_input.json", "w") as f:
    json.dump(input_data, f, indent=4)
    f.write("\n")
