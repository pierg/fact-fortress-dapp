import hashlib


data_int = [6, 38, 3]

# Convert the list of integers to a list of hex strings
data_hex = [hex(d)[2:].zfill(2) for d in data_int]

# Convert the list of hex strings to a byte string
byte_string = bytes.fromhex("".join(data_hex))

# Compute the SHA256 hash of the byte string
hash_object = hashlib.sha256(byte_string)
hash_digest = hash_object.digest()

# Convert the hash digest to a list of hex-encoded bytes
hash_hex_list = [format(b, "02x") for b in hash_digest]

# Print the list of hex-encoded bytes
print(hash_hex_list)


# INT
byte_string_int = b"".join(d.to_bytes(1, byteorder="big") for d in data_int)

# Compute the SHA256 hash of the byte string
hash_object_int = hashlib.sha256(byte_string_int)
hash_digest_int = hash_object_int.digest()
hash_hex_list_int = [format(b, "02x") for b in hash_digest_int]

print(hash_hex_list_int)

# HEX INT
data = [hex(d) for d in data_int]
data_hex_int = [int(d[2:]) for d in data]

byte_string_int = b"".join(d.to_bytes(1, byteorder="big") for d in data_hex_int)

# Compute the SHA256 hash of the byte string
hash_object_int = hashlib.sha256(byte_string_int)
hash_digest_int = hash_object_int.digest()
hash_hex_list_int = [format(b, "02x") for b in hash_digest_int]

print(hash_hex_list_int)
