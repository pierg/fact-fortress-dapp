import random
import json
import hashlib

alleles_combinations = [
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


def generate_genetic_data():
    # Returns a dictionary of random genetic data
    genetic_data = {
        "rs10757274": random.choice(["AA", "AG", "GG"]),
        "rs562556": random.choice(["AA", "AG", "GG"]),
        "rs429358": random.choice(["CC", "CT", "TT"]),
        "rs7412": random.choice(["CC", "CT", "TT"]),
        "rs1801133": random.choice(["CC", "CT", "TT"]),
    }
    return genetic_data


def generate_patient_data(num_patients):
    # Returns a dictionary of patient data
    patients = {}
    for i in range(num_patients):
        patient_id = "patient-id-" + str(i)
        genetic_data = generate_genetic_data()
        name = random.choice(["Alice", "Bob", "Charlie", "Desmond", "Eve", "Frank"])
        patient_data = {"genetic-data": genetic_data, "name": name}
        patients[patient_id] = patient_data
    return patients


def generate_authority_data(company_name, num_patients):
    # Returns a dictionary of authority data
    patients = generate_patient_data(num_patients)
    r = hashlib.sha256(company_name.encode()).hexdigest()
    s = hashlib.sha256(str(num_patients).encode()).hexdigest()
    authority_data = {"authority": company_name, "data": patients, "r": "0x" + r, "s": "0x" + s}
    return authority_data


def generate_public_keys(authority_data_list):
    # Returns a dictionary of public keys
    public_keys = {}
    for authority_data in authority_data_list:
        public_key = hashlib.sha256(authority_data["authority"].encode()).hexdigest()
        public_keys[authority_data["authority"]] = "0x" + public_key
    return public_keys


def generate_fake_data(num_patients_auth_a, num_patients_auth_b):
    # Returns a dictionary of fake patient data
    authority_data_list = []
    authority_data_list.append(generate_authority_data("company-A", num_patients_auth_a))
    authority_data_list.append(generate_authority_data("company-B", num_patients_auth_b))
    private_data = {"auth-A": authority_data_list[0], "auth-B": authority_data_list[1]}
    public_keys = generate_public_keys(authority_data_list)
    fake_data = {"private-data": private_data, "public-keys": public_keys}
    return fake_data


# Generate fake patient data and save to JSON file
fake_data = generate_fake_data(2, 2)
with open("fake_patient_data.json", "w") as f:
    json.dump(fake_data, f, indent=4)
