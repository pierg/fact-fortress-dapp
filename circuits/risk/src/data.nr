global D1_SIZE: Field = 50;
global D1_SHAPE: [u8; 2] = [5, 10];

global D2_SIZE: Field = 5;
global D2_SHAPE: [u8; 2] = [5, 1];
global D2_PRECISION: u4 = 2;

global DATA_SIZE: Field = 55;

struct Data {
    // Alleles of individuals from Hospital A
    d1: [u8; 50],
    // Beta values of heart conditions from Hospital A
    d2: [u8; 5],
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
