import toml
import hashlib
import ecdsa
import pathlib

# Load the signature, public key, and hashed message from the TOML file
with open(pathlib.Path(__file__).parent / "signature.toml", "r") as f:
    toml_dict = toml.load(f)
hashed_message = bytes(toml_dict["hashed_message"])
pub_key_str = toml_dict["pub_key_x"] + toml_dict["pub_key_y"]
pub_key = bytes(pub_key_str)
signature = bytes(toml_dict["signature"])

# Verify the signature
vk = ecdsa.VerifyingKey.from_string(pub_key, curve=ecdsa.SECP256k1)
assert vk.verify(signature, hashed_message)
