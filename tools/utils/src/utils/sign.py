import requests
import json


def gen_key_pairs() -> tuple[str]:
    # Fetch the key pair
    key_pair_url = "http://localhost:3000/key_pair"
    response = requests.get(key_pair_url)

    # Handle the response
    if response.status_code == 200:
        key_pair = json.loads(response.text)
        print(
            f"Successfully generated the key-pair:\n{key_pair['private_key'], key_pair['public_key']}"
        )
        return key_pair["private_key"], key_pair["public_key"]
    else:
        error = json.loads(response.text)["error"]
        print("Error while generating key-pair", error)


def sign(message_hash: list[int], private_key: str) -> list[int]:
    # Sign a message
    sign_url = "http://localhost:3000/sign_hash"
    payload = {"private_key": private_key, "hash": message_hash}
    print(payload)
    response = requests.post(sign_url, json=payload)

    # Handle the response
    if response.status_code == 200:
        signature = json.loads(response.text)["signature"]
        print("Successfully signed message with signature:", signature)
        return signature
    else:
        error = json.loads(response.text)["error"]
        print("Error while signing message:", error)
