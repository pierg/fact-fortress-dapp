from pathlib import Path
from flatten_json import flatten
import json

from utils.my_io import save_dict_to_json
from utils.my_io import save_dict_to_toml


def encode(input_file: Path, output_folder: Path):
    # Open the JSON file for reading
    with open(input_file, "r") as f:
        # Load the contents of the file into a string
        json_string = f.read()

    # Parse the JSON string into a Python dictionary object
    input_dict = json.loads(json_string)

    output_dict = flatten(input_dict)

    save_dict_to_json(output_dict, output_folder / "data.json")
    save_dict_to_toml(input_dict, output_folder / "data.toml")
    save_dict_to_toml(output_dict, output_folder / "data_flat.toml")
