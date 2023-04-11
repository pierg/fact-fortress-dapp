import json
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.backends import default_backend

# Load the data from the JSON file
with open("signature.json", "r") as f:
    data = json.load(f)

# Convert the message and signature from hexadecimal strings to bytes
message = bytes.fromhex(data["message"])
signature = bytes.fromhex(data["signature"])

# Convert the public key coordinates from hexadecimal strings to integers
public_key_x = int(data["public_key_x"], 16)
public_key_y = int(data["public_key_y"], 16)

# Reconstruct the public key from the coordinates
public_numbers = ec.EllipticCurvePublicNumbers(public_key_x, public_key_y, ec.SECP256R1())
public_key = public_numbers.public_key(default_backend())

# Compute the hash of the message
digest = hashes.Hash(hashes.SHA256(), default_backend())
digest.update(message)
hash_value = digest.finalize()

# Verify the Schnorr signature
try:
    public_key.verify(signature, hash_value, ec.ECDSA(hashes.SHA256()))
    print("Signature is valid!")
except InvalidSignature:
    print("Signature is invalid.")
