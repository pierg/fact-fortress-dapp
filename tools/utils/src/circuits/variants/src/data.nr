global NAME_LENGHT: u8 = 10;
global AUTH_NAME_LENGTH: u8 = 9;

struct PublicStatements{
    rs10757274_GG_percentage: Field,
    rs1801133_TT_percentage: Field
}

struct PublicKeys {
    company_a: Field,
    company_b: Field,
}

struct PrivateData {
    auth_a: AuthA,
    auth_b: AuthB,
}

struct AuthA {
    authority: str<AUTH_NAME_LENGTH>,
    r: Field,
    s: Field,
    data: DataA,
}

struct AuthB {
    data: DataB,
}

struct DataA {
    patient_id_0: PatientData,
    patient_id_1: PatientData,
}

struct DataB {
    patient_id_0: PatientData,
    patient_id_1: PatientData,
}

struct PatientData {
    name: str<NAME_LENGHT>,
    genetic_data: GeneticData,
}

struct GeneticData {
    rs10757274: str<2>,
    rs562556: str<2>,
    rs429358: str<2>,
    rs7412: str<2>,
    rs1801133: str<2>,
}
