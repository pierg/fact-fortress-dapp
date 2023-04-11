// NOTES:
// array of structs are not supported for now
// array of str are not supported for now

global ID_LENGHT: u8 = 11;
global N_RECORDS: u8 = 2;
global NAME_LENGHT: u8 = 12;


struct authorityStruct {
    id: str<ID_LENGHT>,
    records: [u8; N_RECORDS],
}


struct individualStruct {
    name: str<NAME_LENGHT>,
    year: Field,
    authority_1: authorityStruct,
    authority_2: authorityStruct,
}


struct privateData {
    : [u8; N_RECORDS],
}