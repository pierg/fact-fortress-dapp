import pathlib
import hashlib
import toml
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
from cryptography.hazmat.primitives.asymmetric import utils


# Define the message
message = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# Generate a random private key
private_key = X25519PrivateKey.generate()

# Generate the public key from the private key
public_key = private_key.public_key()

# Get the public key bytes
pub_key_bytes = public_key.public_bytes(encoding=utils.Prehashed(hashlib.sha256()), format=utils.PublicFormat.Raw)

# Sign the message using the private key
hash_obj = hashlib.sha256(bytes(message) + pub_key_bytes)
signature = private_key.sign(hash_obj.digest())

# Save the message, public key, and signature to a TOML file
data = {
    "message": message,
    "public_key": list(pub_key_bytes),
    "signature": list(signature),
}

current_folder = pathlib.Path(__file__).parent
with open(current_folder / "signature.toml", "w") as f:
    toml.dump(data, f)

print(len(message))
print(len(list(signature)))
