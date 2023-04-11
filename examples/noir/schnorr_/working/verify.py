import schnorr.schnorr_lib as sl
import pathlib
import toml

current_folder = pathlib.Path(__file__).parent

# Load the data from the TOML file
with open(current_folder / "signature.toml", "r") as f:
    data = toml.load(f)

# Get the message, public key, and signature from the data
message = bytes(data["message"])
signature = bytes(data["signature"])

message_hash = sl.sha256(message.encode())

# pubkey_bytes = bytes.fromhex(public_key)
# pubkey_bytes = sl.bytes_from_int(public_key_x)

pub_key_bytes = bytes(data["pub_key_x"])
sig_bytes = bytes.fromhex(signature.hex())
result = sl.schnorr_verify(message_hash, pub_key_bytes, sig_bytes)

if result:
    print("The signature is VALID for this message and this public key")
else:
    print("The signature is NOT VALID for this message and this public key")
