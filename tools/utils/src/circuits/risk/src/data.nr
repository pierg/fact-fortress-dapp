
global PRECISION: u8 = 1000;

global D1_SIZE: Field = 4;
global D2_SIZE: Field = 2;

// DATA_SIZE = D1_SIZE + D2_SIZE
global DATA_SIZE: Field = 6;

global SUM_SIZE: Field = 8;

struct Public{
    keys: Keys,
    statement: Statement
}

struct Keys {
    x: Field,
    y: Field,
}

struct Statement {
    risk_score: u8,
}

struct Private {
    provenance: Provenance,
    data: Data,
}


struct Provenance {
    signature: [u8; 64],
    hash: [u8; 32],
}

struct Data {
    // individuals
    d1: [u2; D1_SIZE],
    // betas
    d2: [u16; D2_SIZE],
}


