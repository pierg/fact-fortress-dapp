import toml
import pathlib
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
print(len(signature))
signature_list = list(signature)
print(len(signature_list))
print(signature_list)

signature_hex = signature.hex()
signature_bytes = bytes.fromhex(signature_hex)
signature_list = [signature_bytes[i] for i in range(len(signature_bytes))]


message_hex = message.hex()
message_bytes = bytes.fromhex(message_hex)
message_list = [message_bytes[i] for i in range(len(message_bytes))]


current_folder = pathlib.Path(__file__).parent


# Save the message, public key coordinates, and signature to a JSON file
data = {
    "message": message_list,
    "pub_key_x": hex(public_key_x),
    "pub_key_y": hex(public_key_y),
    "signature": signature_list,
}
with open(current_folder / "Prover_generated.toml", "w") as f:
    toml.dump(data, f)

print(len(message_list))
print(len(signature_list))
