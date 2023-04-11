struct Data {
    public_claim: u8,
    public_keys: PublicKeys,
    private_data: PrivateData,
}

struct PublicKeys {
    a: str<65>,
    b: str<65>,
}

struct PrivateData {
    auth_a: AuthA,
    auth_b: AuthB,
}

struct AuthA {
    authority: str<9>,
    r: [u8; 64],
    s: [u8; 64],
    data: AuthAData,
}

struct AuthB {
    authority: String,
    r: [u8; 32],
    s: [u8; 32],
    data: AuthBData,
}

struct AuthAData {
    patient_id_0: AuthAPatientId0,
    patient_id_1: AuthAPatientId1,
}

struct AuthAPatientId0 {
    name: String,
    genetic_data: AuthAPatientId0GeneticData,
}

struct AuthAPatientId0GeneticData {
    rs7376358: String,
    rs1448097: String,
    rs6029041: String,
}

struct AuthAPatientId1 {
    name: String,
    genetic_data: AuthAPatientId1GeneticData,
}

struct AuthAPatientId1GeneticData {
    rs7376358: String,
    rs1448097: String,
    rs6029041: String,
}

struct AuthBData {
    patient_id_0: AuthBPatientId0,
    patient_id_1: AuthBPatientId1,
}

struct AuthBPatientId0 {
    name: String,
    genetic_data: AuthBPatientId0GeneticData,
}

struct AuthBPatientId0GeneticData {
    rs7376358: String,
    rs1448097: String,
    rs6029041: String,
}

struct AuthBPatientId1 {
    name: String,
    genetic_data: AuthBPatientId1GeneticData,
}

struct AuthBPatientId1GeneticData {
    rs7376358: String,
    rs1448097: String,
    rs6029041: String,
}
