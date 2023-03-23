import json
import os
from pathlib import Path


def save_dict_to_json(data: dict, file_path: Path, order: bool = False) -> Path:
    """
    Save a dictionary to a JSON file with optional sorting by key.

    Args:
        data (dict): The dictionary to be saved.
        file_path (str): The path to the JSON file.
        order (bool, optional): Whether to sort the dictionary by key in ascending order. Defaults to False.
    """
    if order:
        data = dict(sorted(data.items()))

    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))

    with open(str(file_path), "w") as f:
        json.dump(data, f, indent=4, sort_keys=False)

    print(f"File saved: {file_path}")
    return file_path


def json_file_to_dict(json_file_path: Path):
    """Returns a dictionary with the contents of the JSON file.

    Args:
      json_file_path (pathlib.Path): The path to the JSON file.

    Returns:
      dict: A dictionary with the contents of the JSON file.
    """

    # Open the JSON file.
    with json_file_path.open("r") as fp:
        data = json.load(fp)

    # Return a dictionary with the contents of the JSON file.
    return data
