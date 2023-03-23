import pathlib

data_folder_path = pathlib.Path(__file__).parent.parent.parent / "data"
data_file_path = data_folder_path / "genetic_data.json"
signature_data_file_path = data_folder_path / "genetic_data_signature.json"
