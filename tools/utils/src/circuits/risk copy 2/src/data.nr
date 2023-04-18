global D2_SIZE: Field = 10;
global N_INDIVIDUALS: u8 = 5;
global PRECISION: u8 = 1000;

// D1_SIZE = D2_SIZE*N_INDIVIDUALS
global D1_SIZE: Field = 50;
// DATA_SIZE = D1_SIZE + D2_SIZE
global DATA_SIZE: Field = 60;


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
    individuals: [u8; D1_SIZE],
    betas_int: [u8; D2_SIZE],
}


