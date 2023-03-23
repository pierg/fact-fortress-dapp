from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Generate RSA key pair
key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

# Define the genomic data
data = {
    "id": "1",
    "name": "Alice",
    "genetic_data": [
        {"rs114525117": "GG"},
        {"rs12124819": "TT"},
        {"rs41285816": "CT"},
        {"rs113261977": "AG"},
        {"rs12731175": "AA"},
    ],
    "id": "2",
    "name": "Bob",
    "genetic_data": [
        {"rs114622732": "TT"},
        {"rs12731175": "CC"},
        {"rs41285816": "CT"},
        {"rs28710181": "AG"},
        {"rs3795289": "GG"},
    ]
}

# Serialize and hash the data
data_str = str(data)
data_bytes = data_str.encode()
digest = hashes.Hash(hashes.SHA256())
digest.update(data_bytes)
msg_hash = digest.finalize()

# Sign the message hash
signature = key.sign(
    msg_hash,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# Verify the signature
public_key = key.public_key()
try:
    public_key.verify(
        signature,
        msg_hash,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print(signature)
    print(msg_hash)
    print("Signature is valid!")
except:
    print("Signature is invalid.")
