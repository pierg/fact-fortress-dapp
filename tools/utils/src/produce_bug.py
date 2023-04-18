from utils.sign import gen_key_pairs
from utils.genhash import get_hash_simple
import numpy as np

DATA_SIZE = 3

# Generate some data
data = np.random.randint(0, 50, size=DATA_SIZE)

data = np.array([6, 38, 3])

data_hash = get_hash_simple(data)

priv_key, pub_key = gen_key_pairs()
