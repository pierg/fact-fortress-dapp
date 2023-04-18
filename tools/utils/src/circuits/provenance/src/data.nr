global D1_SIZE: Field = 3;
global DATA_SIZE: Field = 3;


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
    // random data
    d1: [u8; 3],
}
