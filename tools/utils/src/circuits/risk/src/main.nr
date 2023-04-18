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

fn custom_sum(data: data::Private:Data) -> [u8; data::SUM_SIZE]  {
    let mut result = [0; data::SUM_SIZE];
    for i in 0..data::DATA_SIZE {
        let mut index_1 = i as u8 % data::D1_SIZE as u8;
        let mut index_2 = i as u8 % data::D2_SIZE as u8;
        let sum = (data.d1[index_1] as u8 + data.d1[index_2] as u8) % 256;
        let mut index = i as u8 % data::SUM_SIZE as u8;
        result[index as Field] = sum;
    };
    result 
}


fn main(
    public : pub data::Public,
    private : pub data::Private,
    ) -> pub [u32; data::DATA_SIZE] {

    // Transorm input in flat array
    let mut flat_data = convert_to_array(private);

    // Convert to fixed legth array
    // let mut data_sum = custom_sum(flat_data);

    // Compute hash
    // let mut digest256 = std::sha256::digest(data_sum);
    
    // Check data has not been compromised
    // constrain digest256 == private.provenance.hash;

    // constrain private.provenance.hash == [229,27,136,201,239,46,231,160,132,246,118,164,208,115,19,137,94,40,80,246,120,158,27,177,170,152,69,195,210,221,109,234];
    constrain public.keys.x == 31408930950303160359960467821144649185997809649020691559087946667608250512807;

    // Proof of provenance
    // let provenance_check = std::schnorr::verify_signature(public.keys.x, public.keys.y, private.provenance.signature, digest256);
    // constrain provenance_check == 1;
    flat_data
}
