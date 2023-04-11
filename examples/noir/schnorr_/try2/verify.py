import hashlib
import pathlib
import toml
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PublicKey, X25519PrivateKey
from cryptography.hazmat.primitives.asymmetric import utils

current_folder = pathlib.Path(__file__).parent

# Load the data from the TOML file
with open(current_folder / "signature.toml", "r") as f:
    data = toml.load(f)

# Get the message, public key, and signature from the data
message = bytes(data["message"])
pub_key_bytes = bytes(data["public_key"])
signature = bytes(data["signature"])

# Create a public key from the bytes
public_key = X25519PublicKey.from_public_bytes(pub_key_bytes)

# Verify the signature
try:
    hash_obj = hashlib.sha256(message + pub_key_bytes)
    public_key.verify(signature, hash_obj.digest())
    print("Signature is valid!")
except:
    print("Signature is invalid!")
