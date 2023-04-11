import pathlib
import toml
import create_keypair as ckp
import schnorr_lib as sl
from schnorr_lib import bytes_from_int
import binascii

current_folder = pathlib.Path(__file__).parent


# Parse the TOML file
with open(current_folder / "Prover_generated.toml") as f:
    data = toml.load(f)

# Extract message, public key, and signature
message = bytes(data["message"])
# pub_key_x = int(data["public_key"]["x"], 16)
# pub_key_y = int(data["public_key"]["y"], 16)
signature = bytes(data["signature"])


# M = input("Insert the message to verify:")
# M = sl.sha256(M.encode())

# pubkey_bytes = bytes.fromhex(pub_key_x)
# pubkey_bytes = bytes_from_int()

# sig = input("Insert the generated sign:")
# sig_bytes = bytes.fromhex(sig)

hex_int = int(data["pub_key_x"], 16)
hex_hex = hex(int(data["pub_key_x"], 16))

# pubkey_bytes = bytes.fromhex(hex(int(data["pub_key_x"], 16))
# pubkey_bytes = bytes.fromhex(data["pub_key_x"])
pubkey_bytes = binascii.unhexlify(data["pub_key_x"])
result = sl.schnorr_verify(message, pubkey_bytes, signature)

if result:
    print("The signature is VALID for this message and this public key")
else:
    print("The signature is NOT VALID for this message and this public key")
