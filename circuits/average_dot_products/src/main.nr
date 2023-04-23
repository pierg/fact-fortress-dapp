use dep::std;
mod data;

// Concatenates the data into a byte array of size `DATA_SIZE`.// This function returns the concatenated byte array.mod data;

fn concatenate(data: data::Data) -> [u8; data::DATA_SIZE]  {
    let mut result = [0; data::DATA_SIZE];
    let mut cur_i = 0;
    // Two-dimensional matrix from Provider_A
    // Copy the contents of d1 into the byte array.
    for i in 0..data::D1_SIZE {
        result[cur_i] = data.d1[i] as u8;
        cur_i = cur_i + 1;
    }
    // Vector of quantized double from Provider_A
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


    
// Compute the dot product of two one dimensional arrays of the same size
// x : first array, y : second array
fn dot_product(x : [u8; data::D2_SHAPE_0], y : [u8; data::D2_SHAPE_0]) -> u16 {
    let mut result = 0;

    // Loop through the elements of the arrays and compute the dot product
    for i in 0..2 {
        result = result + (x[i] as u16 * y[i] as u16); // Cast to avoid overflow
    }
    result
}


// Unroll the two dimensional array x into a one dimensional array, 
// then compute the dot products of the unrolled arrays with y
// Returns an array of DP1_SHAPE_1 dot products
fn unroll_and_compute(x : [u8; data::D1_SIZE], 
                    y : [u8; data::D2_SHAPE_0]) -> [u16; 4] {
    let mut result = [0; 4];
    // For each row of x, unroll it and compute dot product with y
    for i in 0..4 {
        let start = i * 2 as Field;
        let end = start + 2 as Field;
        let mut x_slice = [0; 2];
        for j in start..end {
            let mut slice_index = j - start;
            x_slice[slice_index] = x[j] as u8;
            result[i] = dot_product(x_slice, y);
        }
    }
    result
}

// Compute the average of the values in an array
// x : array of values for which the average will be computed
fn average(x: [u16; 4]) -> u16 {
    let mut sum = 0;
    for i in 0..4 as Field {
        sum += x[i] as u32;
    }
    let avg = sum / 4 as u32; // Cast to u32 to avoid overflow
    avg as u16 // Cast back to u16 to match the function signature
}

// Perform some meaningful operations on the data and return the result.
fn perform_computation_on_data(data: data::Data) -> u16 {
    
    let dot_products = unroll_and_compute(data.d1, data.d2);

    let average = average(dot_products);

    average

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

        