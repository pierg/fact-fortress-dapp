global D1_SIZE: Field = 8;
global D1_SHAPE_0: u8 = 2;
global D1_SHAPE_1: u8 = 4;

global D2_SIZE: Field = 2;
global D2_SHAPE_0: u8 = 2;
global D2_SHAPE_1: u8 = 1;
global D2_PRECISION: u4 = 2;

global DATA_SIZE: Field = 10;

struct Data {
    // Two-dimensional matrix from Provider_A
    d1: [u8; 8],
    // Vector of quantized double from Provider_A
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
    value: u16,
}

struct Private {
    provenance: Provenance,
    data: Data,
}

struct Provenance {
    signature: [u8; 64],
    hash: [u8; 32],
}
