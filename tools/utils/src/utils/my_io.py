import json
import os
from pathlib import Path
import toml


def save_dict_to_toml(
    data: dict, file_path: Path, order: bool = False, comments: str = ""
) -> Path:
    """
    Save a dictionary to a TOML file with optional sorting by key.

    Args:
        data (dict): The dictionary to be saved.
        file_path (Path): The path to the TOML file.
        order (bool, optional): Whether to sort the dictionary by key in ascending order. Defaults to False.
        comments (str, optional): Comments to add at the beginning of the TOML file. Defaults to "".
    """
    if order:
        data = dict(sorted(data.items()))

    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))

    with open(str(file_path), "w") as f:
        if comments:
            f.write(f"{'#' * 30}\n")
            for line in comments.splitlines():
                f.write(f"#\t{line}\n")
            f.write(f"{'#' * 30}\n\n")
        toml.dump(data, f)

    print(f"File saved: {file_path}")
    return file_path


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


config = {
    "data_sizes": [4, 2],
    "data_formats": ["u2", "u16"],
    "data_comments": ["individuals", "betas"],
    "precision": 10,
    "sum_size": 8,
}


def generate_data_file(config: dict, file_path: Path):
    data_sizes = config["data_sizes"]
    data_formats = config["data_formats"]
    data_comments = config["data_comments"]
    precision = None
    sum_size = None
    population_size = None
    if "precision" in config:
        precision = config["precision"]
    if "sum_size" in config:
        sum_size = config["sum_size"]
    if "population_size" in config:
        population_size = config["population_size"]
    num_data_fields = len(data_sizes)

    with open(str(file_path), "w") as f:
        for i in range(num_data_fields):
            f.write("global D{}_SIZE: Field = {};\n".format(i + 1, data_sizes[i]))
        f.write("global DATA_SIZE: Field = {};\n".format(sum(data_sizes)))
        if population_size is not None:
            f.write("global POPULATION_SIZE: Field = {};\n".format(population_size))
        if precision is not None:
            f.write("global PRECISION: u8 = {};\n".format(precision))
        f.write("\n")
        if sum_size is not None:
            f.write("global SUM_SIZE: Field = {};\n".format(sum_size))
        f.write("\n")
        f.write("struct Public{\n")
        f.write("    keys: Keys,\n")
        f.write("    statement: Statement\n")
        f.write("}\n")
        f.write("\n")
        f.write("struct Keys {\n")
        f.write("    x: Field,\n")
        f.write("    y: Field,\n")
        f.write("}\n")
        f.write("\n")
        f.write("struct Statement {\n")
        f.write("    value: u8,\n")
        f.write("}\n")
        f.write("\n")
        f.write("struct Private {\n")
        f.write("    provenance: Provenance,\n")
        f.write("    data: Data,\n")
        f.write("}\n")
        f.write("\n")
        f.write("struct Provenance {\n")
        f.write("    signature: [u8; 64],\n")
        f.write("    hash: [u8; 32],\n")
        f.write("}\n")
        f.write("\n")
        f.write("struct Data {\n")
        for i in range(num_data_fields):
            f.write("    // {}\n".format(data_comments[i]))
            f.write(
                "    d{}: [{}; {}],\n".format(i + 1, data_formats[i], data_sizes[i])
            )
        f.write("}\n")

    print(f"File saved: {file_path}")
