// NOTES:
// array of structs are not supported for now
// array of str are not supported for now


struct authorityStruct {
    id: str<11>,
    records: [u8; 2],
}


struct individualStruct {
    name: str<12>,
    year: Field,
    authority_1: authorityStruct,
    authority_2: authorityStruct,
}
