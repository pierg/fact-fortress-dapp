use dep::std;


// pub_key_x = pub_key_x_hospital
// pub_key_y = pub_key_y_hospital

fn main(pub_key_x: pub Field, 
        pub_key_y: pub Field, 
        signed_hash_of_data: [u8; 64], 
        data: []) {
    
    let result = std::schnorr::verify_signature(pub_key_x, pub_key_y, signed_hash_of_data, data);
    constrain result == 1;
}

// Proof that secret data has been signed oyb pub_key_x 
// the prove has been generated with the inputs:
// pub_key_x = pub_key_x_hospital
// pub_key_y = pub_key_y_hospital



Verify(proof,pub_key_x_hospital, pub_key_y_hospital)

// if pub_key_x and pub_key_y are not equal to pub_key_x_hospital and pub_key_y_hospital the proof will fail

