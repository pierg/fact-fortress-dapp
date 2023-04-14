from pathlib import Path
from flatten_json import unflatten
import json

from .my_io import save_dict_to_json


def decode(input_file: Path, output_file):
    # Open the JSON file for reading
    with open(input_file, "r") as f:
        # Load the contents of the file into a string
        json_string = f.read()

    # Parse the JSON string into a Python dictionary object
    input_dict = json.loads(json_string)

    output_dict = unflatten(input_dict)

    save_dict_to_json(output_dict, output_file)
