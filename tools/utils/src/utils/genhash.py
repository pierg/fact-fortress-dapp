import hashlib
from shared import sum_size


class Data:
    def __init__(self):
        # individuals
        self.d1 = [0] * D1_SIZE
        # betas
        self.d2 = [0] * D2_SIZE


def custom_sum_new(data: list[int]) -> list[int]:
    result = [0] * SUM_SIZE
    for i in range(DATA_SIZE):
        index_1 = i % D1_SIZE
        index_2 = i % D2_SIZE
        sum_val = (data[index_1][0] + data[index_2][0]) % 256
        index = i % SUM_SIZE
        result[index] = (result[index] + sum_val) % 256
    return result


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


def get_hash_simple(data: list[int]) -> list[int]:
    # Convert to list of 8 bytes
    custom_array_bytes = bytes(data)

    # Create an list of 32 bytes representing the SHA256 of custom_array_bytes
    hash_bytes = hashlib.sha256(custom_array_bytes).digest()

    # Return the hex digest of the hash
    return "".join("{:02x}".format(x) for x in hash_bytes)
