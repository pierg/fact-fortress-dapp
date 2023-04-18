global D1_SIZE: Field = 6;
global D2_SIZE: Field = 3;
global DATA_SIZE: Field = 9;
global POPULATION_SIZE: Field = 2;
global PRECISION: u8 = 10;

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

struct Data {
    // individuals
    d1: [u2; 6],
    // betas
    d2: [u16; 3],
}
