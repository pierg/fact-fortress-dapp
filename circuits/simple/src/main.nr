use dep::std;
mod data;

// Concatenates the data into a byte array of size `DATA_SIZE`.// This function returns the concatenated byte array.mod data;

fn concatenate(data: data::Data) -> [u8; data::DATA_SIZE]  {
    let mut result = [0; data::DATA_SIZE];
    let mut cur_i = 0;
    // Sample data description 1
    // Copy the contents of d1 into the byte array.
    for i in 0..data::D1_SIZE {
        result[cur_i] = data.d1[i] as u8;
        cur_i = cur_i + 1;
    }
    // Sample data description 2
    // Copy the contents of d2 into the byte array.
    for i in 0..data::D2_SIZE {
        result[cur_i] = data.d2[i] as u8;
        cur_i = cur_i + 1;
    }
    result
}



// Verify the authenticity and integrity of the data by concatenating it, 
// computing its SHA256 hash, and verifying its Schnorr signature using the 
// public keys and the signature from the provenance.
fn verify_data_provenance(
    data: data::Data,    // The data to be verified.
    keys: data::Keys,    // The public keys to be used for the verification.
    provenance: data::Provenance    // The provenance object containing the signature to be verified.
) -> Field  {
    // Concatenate all the data.
    let flat_data = concatenate(data);

    // Compute the SHA256 hash of the concatenated data.
    let mut digest256 = std::sha256::digest(flat_data);

    // Verify the Schnorr signature of the hash using the public keys and the signature from the provenance.
    std::schnorr::verify_signature(
        keys.pub_key_x, 
        keys.pub_key_y, 
        provenance.signature, 
        digest256)
}


// Perform some meaningful operations on the data and return the result.
fn perform_computation_on_data(data: data::Data) -> u8  {
    // TODO: Implement the actual computation on the data.

    // Dummy implementation that returns zero.
    let mut result = data.d1[0];
    result = 0;

    result as u8
}

fn main(
    public : pub data::Public,    // Data containing the expected result.
    private : data::Private,    // Data to be verified and processed.
    ){

    // Verify the authenticity and integrity of the private data.
    constrain verify_data_provenance(private.data, public.keys, private.provenance) == 1;

    // Perform some meaningful operations on the private data.
    let result = perform_computation_on_data(private.data);

    // Verify that the obtained result matches the value specified in the public statement.
    constrain result == public.statement.value;

}

        