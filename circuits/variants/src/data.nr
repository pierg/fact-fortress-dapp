global D1_SIZE: Field = 25;
global D1_SHAPE: [u8; 2] = [5, 5];

global D2_SIZE: Field = 25;
global D2_SHAPE: [u8; 2] = [5, 5];

global DATA_SIZE: Field = 50;

struct Data {
    // Genome sequence of individuals from Clinic A
    d1: [u8; 25],
    // Genome sequence of individuals from Clinic B
    d2: [u8; 25],
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
