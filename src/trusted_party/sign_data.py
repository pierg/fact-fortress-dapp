import base64
import json
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from utils.my_io import json_file_to_dict

from utils.my_io import save_dict_to_json


def sign_data(data_path: Path, signature_data_file_path: Path) -> Path:

    # Serialize the data
    data_dict = json_file_to_dict(data_path)
    data_str = json.dumps(data_dict)
    data = data_str.encode()

    # Generate a new private/public key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    public_key = private_key.public_key()

    # Serialize the private and public keys
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    # Hash the data
    digest = hashes.Hash(hashes.SHA256())
    digest.update(data)
    hashed_data = digest.finalize()

    # Sign the hashed data with the private key
    signature = private_key.sign(
        hashed_data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )

    # Create a dictionary with the public key, hashed data, and signature
    data_info = {
        "public_key": public_key_pem.decode("utf-8"),
        "hashed_data": hashed_data.hex(),
        "signature": signature.hex(),
    }

    return save_dict_to_json(data_info, signature_data_file_path)
