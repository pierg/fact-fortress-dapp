import toml
import hashlib
import ecdsa
import pathlib

# Generate a new key pair
sk = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
vk = sk.get_verifying_key()

# Hash the message
message = b"Hello, world!"
hashed_message = hashlib.sha256(message).digest()

# Sign the hashed message
signature = sk.sign(hashed_message)

# Save the signature and public key to a TOML file
toml_dict = {
    "hashed_message": list(hashed_message),
    "pub_key_x": list(vk.pubkey.point.x().to_bytes(32, byteorder="big")),
    "pub_key_y": list(vk.pubkey.point.y().to_bytes(32, byteorder="big")),
    "signature": list(signature),
}
with open(pathlib.Path(__file__).parent / "signature.toml", "w") as f:
    toml.dump(toml_dict, f)
