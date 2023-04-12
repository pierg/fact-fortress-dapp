from utils.verify import verify_signature
from trusted_party.sign_data import sign_data
from utils.generate_data import generate_genomic_data
from shared.paths import data_file_path, signature_data_file_path, input_file, data_folder_path
from utils.encoder import encode

# # Generate random genomic data
generate_genomic_data(5, data_file_path)
# # # Trusted party signs data authenticity
# sign_data(data_file_path, signature_data_file_path)
# # Verify data
# verify_signature(signature_data_file_path)


encode(input_file, data_folder_path)
