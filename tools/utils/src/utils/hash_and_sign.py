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
