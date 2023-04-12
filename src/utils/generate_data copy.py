import json
from pathlib import Path
import random
from utils.my_io import save_dict_to_json


def generate_genomic_data(n: int, data_file_path) -> Path:
    """Generates n random entries of genetic data"""

    data = []
    for i in range(1, n + 1):
        name = "".join(
            [chr(random.randint(65, 90)) for _ in range(random.randint(3, 10))]
        )
        genetic_data = [
            {
                "rs"
                + str(random.randint(1, 100000000)): random.choice(
                    [
                        "AA",
                        "AG",
                        "AC",
                        "AT",
                        "GG",
                        "GA",
                        "GC",
                        "GT",
                        "CC",
                        "CA",
                        "CG",
                        "CT",
                        "TT",
                        "TA",
                        "TC",
                        "TG",
                    ]
                )
            }
            for _ in range(random.randint(1, 10))
        ]
        entry = {"id": str(i), "name": name, "genetic_data": genetic_data}
        data.append(entry)

    sorted_data = sorted(data, key=lambda x: int(x["id"]))

    return save_dict_to_json(sorted_data, data_file_path)
