import pathlib

data_folder_path = pathlib.Path(__file__).parent.parent.parent / "data"
data_file_path = data_folder_path / "genetic_data.json"
input_file = data_folder_path / "data_example.json"

data_original_path_mod = data_folder_path / "data_example_mod.json"
data_encoded_path = data_folder_path / "data_ecoded.json"
signature_data_file_path = data_folder_path / "genetic_data_signature.json"
