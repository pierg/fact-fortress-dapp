global D1_SIZE: Field = 2;
global D1_SHAPE: [u8; 2] = [2, 1];

global D2_SIZE: Field = 2;
global D2_SHAPE: [u8; 2] = [2, 1];

global DATA_SIZE: Field = 4;

struct Data {
    // Genome sequence of individuals from Clinic A
    d1: [u8; 2],
    // Genome sequence of individuals from Clinic B
    d2: [u8; 2],
}

struct Public{
    keys: Keys,
    statement: Statement
}

struct Keys {
    pub_key_x: Field,
    pub_key_y: Field,
}

struct Statement {
    value: u8,
}

struct Private {
    provenance: Provenance,
    data: Data,
}

struct Provenance {
    signature: [u8; 64],
    hash: [u8; 32],
}
