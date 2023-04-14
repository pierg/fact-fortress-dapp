from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

from utils.my_io import json_file_to_dict


def verify_signature(data_signature_path: Path):

    data_dict = json_file_to_dict(data_signature_path)

    # Deserialize the public key
    public_key = serialization.load_pem_public_key(
        data_dict["public_key"].encode("utf-8")
    )

    # Get the hashed data and signature from the dictionary
    hashed_data = bytes.fromhex(data_dict["hashed_data"])
    signature = bytes.fromhex(data_dict["signature"])

    # Verify the hash with the public key
    try:
        public_key.verify(
            signature,
            hashed_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )
        print("Hash is valid!")
    except:
        print("Hash is invalid!")
