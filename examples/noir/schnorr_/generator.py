import create_keypair as ckp
import schnorr_lib as sl

n_keys = 1

user = ckp.create_keypair(1)["users"]

M = "Hello, world!"
M = sl.sha256(M.encode())

sig = sl.schnorr_sign(M, user[0]["privateKey"])

print("PublicKey =", user[0]["publicKey"])
print("Signature =", sig)
print(len(sig))
print("Signature =", sig.hex())
