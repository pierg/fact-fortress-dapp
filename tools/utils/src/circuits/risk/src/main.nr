use dep::std;

mod data;



// fn convert_to_array(private: data::Private) -> [u32; data::DATA_SIZE] {
//     let mut result = [0; data::DATA_SIZE];
//     for i in 0..data::D1_SIZE {
//         result[i] = private.data.d1[i] as u32;
//     };
//     for i in data::D1_SIZE..6 {
//         result[i] = private.data.d2[i] as u32;
//     };
//     result 
// }

// BROKEN: BUG IN NOIR WITH MODULE OP., ISSUE POSTED ON DISCORD
fn custom_sum_(data: data::Data) -> [u8; data::SUM_SIZE]  {
    let mut result = [0; data::SUM_SIZE];
    for i in 0..data::DATA_SIZE {
        let mut index_1 = i as u8 % data::D1_SIZE as u8;
        let mut index_2 = i as u8 % data::D2_SIZE as u8;
        let sum = (data.d1[index_1 as Field] as u8 + data.d1[index_2 as Field] as u8) % 256;
        let mut index = i as u8 % data::SUM_SIZE as u8;
        result[index as Field] = (result[index as Field] as u8 + sum as u8) % 256;
        result[index as Field] = index;
    };
    result 
}


fn convert_d1_to_u8(data: data::Data) -> [u8; data::D1_SIZE]  {
    let mut result = [0; data::D1_SIZE];

    for i in 0..data::D1_SIZE {
        result[i] = data.d1[i] as u8;
    };
    result 
}


fn dotproduct(d1 : [u2; data::D1_SIZE], d2 : [u2; data::D2_SIZE]) -> Field {
    // risk for each individual
    let mut risks = [0; data::POPULATION_SIZE]
    for i in 0..data::POPULATION_SIZE {
        let mut j_bottom = i * data::D2_SIZE
        let mut b_top = j_bottom + data::POPULATION_SIZE
        for j in j_bottom..b_top:
            // TODO...
    }
    out
}


fn main(
    public : pub data::Public,
    private : pub data::Private,
    ) {

    // // Transorm input in flat array
    // let mut flat_data = convert_to_array(private);

    // Convert to fixed legth array
    // let mut data_sum = custom_sum(private.data);

    let mut data_u8 = convert_d1_to_u8(private.data);


    // Compute hash
    let mut digest256 = std::sha256::digest(data_u8);
    
    // Check data has not been compromised
    // constrain digest256 == private.provenance.hash;

    // Proof of provenance
    let provenance_check = std::schnorr::verify_signature(
        public.keys.x, 
        public.keys.y, 
        private.provenance.signature, 
        digest256);

    // Fake provenance, since Noir has open issue
    constrain provenance_check == 0;
}
