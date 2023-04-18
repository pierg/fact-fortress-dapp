import hashlib
from shared import sum_size


def custom_sum(data: list[int]) -> list[int]:
    result = [0] * sum_size
    for i, d in enumerate(data):
        index = i % sum_size
        result[index] = (result[index] + d) % 256
    return result


def get_hash(data: list[list[int]]) -> list[int]:
    # Flat the data in a single array
    flattened_data = sum(data, [])

    # Create array of 8 integers
    custom_array = custom_sum(flattened_data)

    # Convert to list of 8 bytes
    custom_array_bytes = bytes(custom_array)

    # Create an list of 32 bytes representing the SHA256 of custom_array_bytes
    hash_bytes = hashlib.sha256(custom_array_bytes).digest()

    # Convert hash_bytes in a list of integers
    hash_ints = [int(b) for b in hash_bytes]

    # Return the hex digest of the hash
    return hash_ints


def get_hash_simple(data_int: list[int]) -> list[int]:
    print(f"data_int:\t{data_hex}")
    # Convert the list of integers to a list of hex strings
    data_hex = [hex(d)[2:].zfill(2) for d in data_int]
    print(f"data:\t{data_hex}")

    # Convert the list of hex strings to a byte string
    byte_string = bytes.fromhex("".join(data_hex))

    # Compute the SHA256 hash of the byte string
    hash_object = hashlib.sha256(byte_string)
    hash_digest = hash_object.digest()

    # Convert the hash digest to a list of hex-encoded bytes
    hash_hex_list = [format(b, "02x") for b in hash_digest]

    print(f"hash_hex:\t{hash_hex_list}")

    # Convert the hash digest to a list of integers
    hash_int_list = [int(b) for b in hash_digest]

    print(f"hash_int:\t{hash_int_list}")

    # Print the list integers
    print(hash_int_list)

    return hash_int_list
