import toml
import pathlib
import schnorr.create_keypair as ckp
import schnorr.schnorr_lib as sl


current_folder = pathlib.Path(__file__).parent


user = ckp.create_keypair(1)["users"]

private_key = user[0]["privateKey"]
public_key = user[0]["publicKey"]
public_key_x = user[0]["pub_x"]
public_key_y = user[0]["pub_y"]

message = "ciao"
message_hash = sl.sha256(message.encode())
signature = sl.schnorr_sign(message_hash, user[0]["privateKey"])


message = "ciao"
message_hash = sl.sha256(message.encode())

# pubkey_bytes = bytes.fromhex(public_key)
pubkey_bytes = sl.bytes_from_int(public_key_x)

sig_bytes = bytes.fromhex(signature.hex())

result = sl.schnorr_verify(message_hash, pubkey_bytes, sig_bytes)

if result:
    print("The signature is VALID for this message and this public key")
else:
    print("The signature is NOT VALID for this message and this public key")


# Save the message, public key, and signature to a TOML file
data = {
    "message": list(bytes(message, "ascii")),
    "pub_key_x": hex(public_key_x),
    "pub_key_y": hex(public_key_y),
    "signature": list(sig_bytes),
}
with open(current_folder / "signature.toml", "w") as f:
    toml.dump(data, f)
