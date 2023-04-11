import json
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

# Generate a random private key
private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

# Extract the public key from the private key
public_key = private_key.public_key()

# Get the x and y coordinates of the public key
public_key_numbers = public_key.public_numbers()
public_key_x = public_key_numbers.x
public_key_y = public_key_numbers.y

# Define the message to be signed
message = b"Hello, world!"

# Compute the hash of the message
digest = hashes.Hash(hashes.SHA256(), default_backend())
digest.update(message)
hash_value = digest.finalize()

# Compute the Schnorr signature
signature = private_key.sign(hash_value, ec.ECDSA(hashes.SHA256()))

print(signature)
signature_hex = signature.hex()
print(signature_hex)
signature_bytes = bytes.fromhex(signature_hex)
# Convert the signature from bytes to an array of 64 u8
signature_list = [signature_bytes[i] for i in range(len(signature_bytes))]
print(signature_list)

# Save the message, public key coordinates, and signature to a JSON file
data = {
    "message": message.hex(),
    "public_key_x": hex(public_key_x),
    "public_key_y": hex(public_key_y),
    "signature": signature.hex(),
}
with open("signature.json", "w") as f:
    json.dump(data, f)
