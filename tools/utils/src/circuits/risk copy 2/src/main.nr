use dep::std;

mod data;


fn convert_to_array(private: data::Private) -> [u8; data::DATA_SIZE] {
    let mut result = [0; data::DATA_SIZE];
    for i in 0..data::D1_SIZE {
        result[i] = private.data.individuals[i];
    };
    for i in 0..data::D2_SIZE {
        result[i] = private.data.betas_int[i];
    };
    result 
}

fn sum(data: [u8; data::DATA_SIZE]) -> u8 {
    let mut result = 0;
    for i in 0..data::DATA_SIZE {
        result = result + data[i];
    };
    result 
}


fn main(
    public : pub data::Public,
    // private : data::Private,
    ) {

    // // Transorm input in flat array
    // let mut flat_data = convert_to_array(private);

    // let mut data_sum = sum(flat_data);

    // // Compute hash
    // let mut digest256 = std::sha256::digest([data_sum]);
    
    // // Check data has not been compromised
    // constrain digest256 == private.provenance.hash;

    constrain public.keys.x == 31408930950303160359960467821144649185997809649020691559087946667608250512807;

    // Proof of provenance
    // let provenance_check = std::schnorr::verify_signature(public.keys.x, public.keys.y, private.provenance.signature, digest256);
    // constrain provenance_check == 1;

}
